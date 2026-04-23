require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

const images = {
  'Bruschetta': 'https://images.unsplash.com/photo-1572691311060-1a7d50c000c0?auto=format&fit=crop&w=400',
  'Spring Rolls': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400',
  'Garlic Bread': 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400',
  'Chicken Wings': 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=400',
  'Grilled Salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400',
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=400',
  'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=400',
  'Butter Chicken': 'https://images.unsplash.com/photo-1603894584713-f484439d3b71?auto=format&fit=crop&w=400',
  'Paneer Tikka Masala': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400',
  'Pasta Carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400',
  'Chocolate Lava Cake': 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=400',
  'Gulab Jamun': 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=400',
  'Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400',
  'Fresh Lime Soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400',
  'Mango Lassi': 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=400',
  'Cold Coffee': 'https://images.unsplash.com/photo-1461023233570-580b0995a59d?auto=format&fit=crop&w=400',
  'Masala Chai': 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=400'
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    for (const [name, url] of Object.entries(images)) {
      await MenuItem.updateOne({ name }, { image: url });
    }

    console.log('✅ All menu images updated!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateImages();
