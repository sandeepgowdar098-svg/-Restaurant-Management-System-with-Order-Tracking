import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import API from '../utils/api';

const TableContext = createContext();

export function TableProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [currentTable, setCurrentTable] = useState(null);
  const [cart, setCart] = useState([]);

  // Restore table session
  useEffect(() => {
    const stored = localStorage.getItem('restaurant_table');
    if (stored) {
      const tableData = JSON.parse(stored);
      setCurrentTable(tableData);
      setCart(tableData.cart || []);
    }
  }, []);

  // Listen for cart updates
  useEffect(() => {
    if (!socket || !currentTable) return;

    socket.emit('join-table', { tableId: currentTable._id, userId: user?._id });

    socket.on('cart-updated', (updatedCart) => {
      setCart(updatedCart);
      setCurrentTable(prev => {
        if (!prev) return prev;
        const updated = { ...prev, cart: updatedCart };
        localStorage.setItem('restaurant_table', JSON.stringify(updated));
        return updated;
      });
    });

    socket.on('table-updated', (tableData) => {
      setCurrentTable(tableData);
      setCart(tableData.cart || []);
      localStorage.setItem('restaurant_table', JSON.stringify(tableData));
    });

    return () => {
      socket.off('cart-updated');
      socket.off('table-updated');
    };
  }, [socket, currentTable?._id, user?._id]);

  const joinTable = async (tableCode) => {
    const res = await API.post('/tables/join', { tableCode });
    const table = res.data;
    setCurrentTable(table);
    setCart(table.cart || []);
    localStorage.setItem('restaurant_table', JSON.stringify(table));

    if (socket) {
      socket.emit('join-table', { tableId: table._id, userId: user?._id });
    }
    return table;
  };

  const leaveTable = async () => {
    if (!currentTable) return;
    try {
      await API.post('/tables/leave', { tableId: currentTable._id });
      if (socket) socket.emit('leave-table', { tableId: currentTable._id });
    } catch (e) { /* ignore */ }
    setCurrentTable(null);
    setCart([]);
    localStorage.removeItem('restaurant_table');
  };

  const addToCart = useCallback((item) => {
    if (!socket || !currentTable) return;
    socket.emit('add-to-cart', {
      tableId: currentTable._id,
      item: {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        addedBy: user?._id,
        image: item.image || ''
      }
    });
  }, [socket, currentTable, user]);

  const updateCartItem = useCallback((menuItemId, quantity) => {
    if (!socket || !currentTable) return;
    socket.emit('update-cart-item', {
      tableId: currentTable._id,
      menuItemId,
      quantity
    });
  }, [socket, currentTable]);

  const removeFromCart = useCallback((menuItemId) => {
    if (!socket || !currentTable) return;
    socket.emit('remove-from-cart', {
      tableId: currentTable._id,
      menuItemId
    });
  }, [socket, currentTable]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <TableContext.Provider value={{
      currentTable, cart, cartTotal,
      joinTable, leaveTable, addToCart, updateCartItem, removeFromCart,
      setCurrentTable, setCart
    }}>
      {children}
    </TableContext.Provider>
  );
}

export const useTable = () => useContext(TableContext);
