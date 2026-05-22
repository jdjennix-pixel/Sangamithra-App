import express from 'express';
import cors from 'cors';
import { db } from './database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API: Get Menu Items
app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu_items', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Parse JSON strings back into arrays/booleans to match the frontend expectations
    const menuItems = rows.map(row => ({
      ...row,
      allergens: JSON.parse(row.allergens || '[]'),
      isAvailable: Boolean(row.isAvailable)
    }));
    res.json(menuItems);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API Server is running successfully on http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the API server.`);
});
