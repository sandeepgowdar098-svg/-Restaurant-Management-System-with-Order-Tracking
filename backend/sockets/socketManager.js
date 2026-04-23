const Table = require('../models/Table');

module.exports = function setupSocket(io) {
  // Production setting: handle connection counts or rate limiting if needed
  let connectionCount = 0;

  io.on('connection', (socket) => {
    connectionCount++;
    console.log(`🔌 Client connected: ${socket.id} (Total: ${connectionCount})`);

    // ─── Join a table room ───
    socket.on('join-table', async ({ tableId, userId }) => {
      try {
        socket.join(`table-${tableId}`);
        console.log(`👤 User ${userId} joined table room: table-${tableId}`);

        const table = await Table.findById(tableId)
          .populate('currentUsers', 'name email');

        // Notify all at table that someone joined
        io.to(`table-${tableId}`).emit('table-updated', table);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Add item to shared cart ───
    socket.on('add-to-cart', async ({ tableId, item }) => {
      try {
        const table = await Table.findById(tableId);
        if (!table) return socket.emit('error', { message: 'Table not found' });

        // Check if item already in cart (handle both ID and object)
        const existingIndex = table.cart.findIndex(ci => {
          const mId = ci.menuItem._id || ci.menuItem;
          return mId.toString() === item.menuItemId;
        });

        if (existingIndex >= 0) {
          table.cart[existingIndex].quantity += item.quantity || 1;
        } else {
          table.cart.push({
            menuItem: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            addedBy: item.addedBy,
            image: item.image || ''
          });
        }

        await table.save();

        // Refetch and populate to ensure data consistency
        const updated = await Table.findById(tableId)
          .populate('currentUsers', 'name email');

        io.to(`table-${tableId}`).emit('cart-updated', updated.cart);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Update cart item quantity ───
    socket.on('update-cart-item', async ({ tableId, menuItemId, quantity }) => {
      try {
        const table = await Table.findById(tableId);
        if (!table) return socket.emit('error', { message: 'Table not found' });

        const itemIndex = table.cart.findIndex(ci => {
          const mId = ci.menuItem._id || ci.menuItem;
          return mId.toString() === menuItemId;
        });

        if (itemIndex >= 0) {
          if (quantity <= 0) {
            table.cart.splice(itemIndex, 1);
          } else {
            table.cart[itemIndex].quantity = quantity;
          }
          await table.save();
        }

        const updated = await Table.findById(tableId)
          .populate('currentUsers', 'name email');

        io.to(`table-${tableId}`).emit('cart-updated', updated.cart);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Remove item from cart ───
    socket.on('remove-from-cart', async ({ tableId, menuItemId }) => {
      try {
        const table = await Table.findById(tableId);
        if (!table) return socket.emit('error', { message: 'Table not found' });

        table.cart = table.cart.filter(ci => {
          const mId = ci.menuItem._id || ci.menuItem;
          return mId.toString() !== menuItemId;
        });
        await table.save();

        io.to(`table-${tableId}`).emit('cart-updated', table.cart);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Order placed — notify kitchen ───
    socket.on('order-placed', ({ order }) => {
      console.log(`🍽️ New order placed for Table ${order.tableNumber}`);
      io.emit('new-order', order);
    });

    // ─── Order status update — notify customers at table ───
    socket.on('order-status-update', ({ order }) => {
      console.log(`📦 Order ${order._id} status → ${order.status}`);
      // Notify the specific table
      if (order.table) {
        const tableId = order.table._id || order.table;
        io.to(`table-${tableId}`).emit('order-status-changed', order);
      }
      // Also broadcast to all (for kitchen/admin dashboards)
      io.emit('order-updated', order);
    });

    // ─── Leave table room ───
    socket.on('leave-table', ({ tableId }) => {
      socket.leave(`table-${tableId}`);
      console.log(`👋 Socket ${socket.id} left table room: table-${tableId}`);
    });

    // ─── Kitchen joins its own room ───
    socket.on('join-kitchen', () => {
      socket.join('kitchen');
      console.log(`🍳 Kitchen staff connected: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      connectionCount--;
      console.log(`❌ Client disconnected: ${socket.id} (Remaining: ${connectionCount})`);
    });
  });
};
