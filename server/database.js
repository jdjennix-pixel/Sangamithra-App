import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

// Using sqlite3's verbose mode for better error stack traces
const sqlite = sqlite3.verbose();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'sangamithra.sqlite');

export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 1. Menu Items Table
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        diet TEXT NOT NULL,
        allergens TEXT,
        spiceLevel INTEGER DEFAULT 0,
        prepTimeMinutes INTEGER DEFAULT 15,
        isAvailable BOOLEAN DEFAULT 1,
        imageUrl TEXT
      )
    `);

    // 2. Dining Tables
    db.run(`
      CREATE TABLE IF NOT EXISTS dining_tables (
        id TEXT PRIMARY KEY,
        tableNumber INTEGER UNIQUE NOT NULL,
        section TEXT NOT NULL,
        seatingCapacity INTEGER NOT NULL,
        status TEXT DEFAULT 'vacant'
      )
    `);

    // Seed Initial Menu Data if Empty
    db.get("SELECT COUNT(*) AS count FROM menu_items", (err, row) => {
      if (!err && row.count === 0) {
        console.log("Seeding initial menu data...");
        const insert = db.prepare(`
          INSERT INTO menu_items (id, category, name, description, price, diet, allergens, spiceLevel, prepTimeMinutes, isAvailable, imageUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const initialMenu = [
          ['m1', 'Soup', 'Nattu Kozhi Soup', 'Traditional Tamil-style country chicken soup with crushed pepper and native spices.', 160, 'non_veg', '[]', 3, 10, 1, '/images/nattu_kozhi_soup.png'],
          ['m2', 'Soup', 'Sweet Corn Veg Soup', 'Creamy sweet corn kernels in a seasoned vegetable stock broth.', 120, 'veg', '[]', 0, 10, 1, '/images/sweet_corn_soup.png'],
          ['m3', 'Starters', 'Chicken 65 (Dry)', 'Crispy deep-fried chicken cubes tossed in ginger, garlic, and hot spices.', 210, 'non_veg', '["egg"]', 2, 15, 1, '/images/chicken_65.png'],
          ['m4', 'Starters', 'Gobi Kempu', 'Crispy cauliflower florets coated in spice blend and yogurt glaze.', 150, 'veg', '["dairy"]', 2, 15, 1, '/images/gobi_kempu.png'],
          ['m5', 'Starters', 'BBQ Paneer Tikka', 'Clay-oven grilled paneer cubes marinated in yogurt, mustard oil, and spices.', 240, 'veg', '["dairy"]', 1, 20, 1, '/images/paneer_tikka.png'],
          ['m6', 'Starters', 'Pallipalayam Chicken Fry', 'Authentic Kongu-style dry chicken prepared with raw coconut slivers and red chilies.', 260, 'non_veg', '[]', 3, 18, 1, '/images/pallipalayam_chicken.png'],
          ['m7', 'Main Course', 'Malabar Fish Curry', 'Tuticorin coastal special fish cooked in a tangy, spiced coconut gravy with raw mango.', 320, 'non_veg', '[]', 2, 20, 1, '/images/fish_curry.png'],
          ['m8', 'Main Course', 'Sangamithra Special Chicken Biryani', 'Premium Seeraga Samba rice chicken biryani slow-cooked with fresh mint and ghee.', 280, 'non_veg', '["dairy"]', 2, 12, 1, '/images/biryani.png'],
          ['m9', 'Main Course', 'Paneer Butter Masala', 'Soft paneer blocks simmered in a luscious tomato-butter-cream gravy.', 220, 'veg', '["dairy", "nuts"]', 1, 15, 1, '/images/paneer.png'],
          ['m10', 'Main Course', 'Coin Parotta (3 Pcs)', 'Crispy, layered flaky flatbreads shaped like coins, perfect with fish curry.', 40, 'veg', '["gluten"]', 0, 8, 1, '/images/coin_parotta.png'],
          ['m11', 'Main Course', 'Butter Naan', 'Freshly baked tandoori wheat bread glazed with rich butter.', 60, 'veg', '["gluten", "dairy"]', 0, 8, 1, '/images/butter_naan.png'],
          ['m12', 'Desserts', 'Rasmalai (2 Pcs)', 'Chilled soft cottage cheese patties soaked in saffron-cardamom flavored milk.', 110, 'veg', '["dairy", "nuts"]', 0, 5, 1, '/images/rasmalai.png'],
          ['m13', 'Desserts', 'Elaneer Payasam', 'Premium coconut-milk dessert mixed with tender coconut pulp slivers.', 130, 'veg', '["dairy"]', 0, 5, 1, '/images/elaneer_payasam.png']
        ];

        initialMenu.forEach(item => {
          insert.run(item);
        });
        insert.finalize();
      }
    });
  });
}
