const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('accounts.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite DB for accounts');
});

db.run(`CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  balance REAL
)`);

// Get all accounts
app.get('/accounts', (req, res) => {
  db.all(`SELECT * FROM accounts`, [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Create account
app.post('/accounts', (req, res) => {
  const { name, balance } = req.body;
  db.run(`INSERT INTO accounts (name, balance) VALUES (?, ?)`, [name, balance], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ id: this.lastID, name, balance });
  });
});

app.listen(8081, () => console.log('Account Service running on http://localhost:8081'));

