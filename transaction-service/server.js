const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('transactions.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite DB for transactions');
});

db.run(`CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accountId INTEGER,
  type TEXT,
  amount REAL,
  targetAccountId INTEGER,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Deposit
app.post('/deposit', (req, res) => {
  const { accountId, amount } = req.body;
  db.run(`INSERT INTO transactions (accountId, type, amount) VALUES (?, 'deposit', ?)`, [accountId, amount], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [amount, accountId]);
    res.json({ success: true });
  });
});

// Withdraw
app.post('/withdraw', (req, res) => {
  const { accountId, amount } = req.body;
  db.run(`INSERT INTO transactions (accountId, type, amount) VALUES (?, 'withdraw', ?)`, [accountId, amount], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`UPDATE accounts SET balance = balance - ? WHERE id = ?`, [amount, accountId]);
    res.json({ success: true });
  });
});

// Transfer
app.post('/transfer', (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  db.run(`INSERT INTO transactions (accountId, type, amount, targetAccountId) VALUES (?, 'transfer', ?, ?)`,
    [fromAccountId, amount, toAccountId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(`UPDATE accounts SET balance = balance - ? WHERE id = ?`, [amount, fromAccountId]);
      db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [amount, toAccountId]);
      res.json({ success: true });
    });
});

// Get transactions of an account
app.get('/transactions/:accountId', (req, res) => {
  const { accountId } = req.params;
  db.all(`SELECT * FROM transactions WHERE accountId = ? OR targetAccountId = ?`, [accountId, accountId], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.listen(8082, () => console.log('Transaction Service running on http://localhost:8082'));

