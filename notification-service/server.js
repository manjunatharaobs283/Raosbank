const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('notifications.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite DB for notifications');
});

db.run(`CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accountId INTEGER,
  message TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Get notifications
app.get('/notifications', (req, res) => {
  db.all(`SELECT * FROM notifications`, [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Add notification
app.post('/notifications', (req, res) => {
  const { accountId, message } = req.body;
  db.run(`INSERT INTO notifications (accountId, message) VALUES (?, ?)`, [accountId, message], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ id: this.lastID, accountId, message });
  });
});

app.listen(8084, () => console.log('Notification Service running on http://localhost:8084'));

