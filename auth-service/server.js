const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('users.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite DB for users');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)`);

// Register user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ id: this.lastID, username });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) res.status(500).json({ error: err.message });
    else if (!row) res.status(401).json({ error: 'Invalid credentials' });
    else res.json({ success: true, username });
  });
});

app.listen(8083, () => console.log('Auth Service running on http://localhost:8083'));

