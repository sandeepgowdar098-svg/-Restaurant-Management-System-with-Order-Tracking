const User = require('./models/User');
const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');

async function seedDatabase() {
  try {
    // ─── Seed Admin ───
    const adminExists = await User.findOne({ email: 'admin@restaurant.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user seeded: admin@restaurant.com / admin123');
    }

    // ─── Seed Kitchen Staff ───
    const kitchenExists = await User.findOne({ email: 'kitchen@restaurant.com' });
    if (!kitchenExists) {
      await User.create({
        name: 'Kitchen Staff',
        email: 'kitchen@restaurant.com',
        password: 'kitchen123',
        role: 'kitchen'
      });
      console.log('✅ Kitchen user seeded: kitchen@restaurant.com / kitchen123');
    }

    // ─── Seed Tables ───
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      const tables = [];
      for (let i = 1; i <= 10; i++) {
        tables.push({ tableNumber: i, capacity: i <= 5 ? 4 : 6 });
      }
      await Table.insertMany(tables);
      console.log('✅ 10 tables seeded');
    }

    // ─── Seed Menu Items ───
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      const items = [
        // Appetizers
        { name: 'Bruschetta', description: 'Toasted bread with tomato, basil, and garlic', price: 249, category: 'Appetizers', image: 'https://images.unsplash.com/photo-1572691311060-1a7d50c000c0?auto=format&fit=crop&w=400' },
        { name: 'Spring Rolls', description: 'Crispy rolls stuffed with vegetables', price: 199, category: 'Appetizers', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400' },
        { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 149, category: 'Appetizers', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400' },
        { name: 'Chicken Wings', description: 'Spicy fried chicken wings with dipping sauce', price: 349, category: 'Appetizers', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=400' },
        // Main Course
        { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with lemon butter sauce', price: 699, category: 'Main Course', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400' },
        { name: 'Chicken Biryani', description: 'Fragrant basmati rice with tender chicken pieces', price: 399, category: 'Main Course', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=400' },
        { name: 'Margherita Pizza', description: 'Classic pizza with mozzarella, tomato, and basil', price: 449, category: 'Main Course', image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=400' },
        { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 449, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603894584713-f484439d3b71?auto=format&fit=crop&w=400' },
        { name: 'Paneer Tikka Masala', description: 'Cottage cheese in spiced tomato gravy', price: 379, category: 'Main Course', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400' },
        { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 399, category: 'Main Course', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400' },
        // Desserts
        { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 299, category: 'Desserts', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=400' },
        { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose syrup', price: 149, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=400' },
        { name: 'Tiramisu', description: 'Italian coffee-flavored layered dessert', price: 349, category: 'Desserts', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400' },
        // Beverages
        { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda water', price: 99, category: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400' },
        { name: 'Mango Lassi', description: 'Chilled yogurt drink with mango pulp', price: 149, category: 'Beverages', image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=400' },
        { name: 'Cold Coffee', description: 'Iced coffee with cream and sugar', price: 179, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023233570-580b0995a59d?auto=format&fit=crop&w=400' },
        { name: 'Masala Chai', description: 'Indian spiced tea with milk', price: 59, category: 'Beverages', image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=400' },
      ];
      await MenuItem.insertMany(items);
      console.log('✅ Menu items seeded');
    }

    // ─── Force Update Images for Existing Items ───
    const imagesToUpdate = [
      { name: 'Bruschetta', image: 'https://images.unsplash.com/photo-1572691311060-1a7d50c000c0?auto=format&fit=crop&w=400' },
      { name: 'Spring Rolls', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400' },
      { name: 'Garlic Bread', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400' },
      { name: 'Chicken Wings', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=400' },
      { name: 'Grilled Salmon', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400' },
      { name: 'Chicken Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=400' },
      { name: 'Margherita Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=400' },
      { name: 'Butter Chicken', image: 'https://images.unsplash.com/photo-1603894584713-f484439d3b71?auto=format&fit=crop&w=400' },
      { name: 'Paneer Tikka Masala', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400' },
      { name: 'Pasta Carbonara', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400' },
      { name: 'Chocolate Lava Cake', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=400' },
      { name: 'Gulab Jamun', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=400' },
      { name: 'Tiramisu', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400' },
      { name: 'Fresh Lime Soda', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400' },
      { name: 'Mango Lassi', image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=400' },
      { name: 'Cold Coffee', image: 'https://images.unsplash.com/photo-1461023233570-580b0995a59d?auto=format&fit=crop&w=400' },
      { name: 'Masala Chai', image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=400' },
    ];

    for (const item of imagesToUpdate) {
      await MenuItem.updateOne({ name: item.name }, { $set: { image: item.image } });
    }
    console.log('✅ All menu images updated to high-quality URLs');

  } catch (error) {
    console.error('Seed error:', error.message);
  }
}

module.exports = seedDatabase;
