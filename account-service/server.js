const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 8081;

app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./accounts.db", (err) => {
  if (err) console.error("DB connection error:", err.message);
  else console.log("Connected to SQLite DB for accounts");
});

// Create accounts table if it doesn't exist
db.run(`
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  balance REAL NOT NULL,
  createdAt TEXT NOT NULL
)
`);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Account Service is running! Use /accounts");
});

// Get all accounts
app.get("/accounts", (req, res) => {
  db.all("SELECT * FROM accounts", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a new account
app.post("/accounts", (req, res) => {
  const { name, balance } = req.body;
  if (!name || balance === undefined) {
    return res.status(400).json({ error: "Name and balance are required" });
  }
  const createdAt = new Date().toISOString();
  const sql = "INSERT INTO accounts (name, balance, createdAt) VALUES (?, ?, ?)";
  db.run(sql, [name, balance, createdAt], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, balance, createdAt });
  });
});

// Update account balance
app.post("/accounts/update", (req, res) => {
  const { id, balance } = req.body;
  if (!id || balance === undefined) return res.status(400).json({ error: "id and balance required" });

  const sql = "UPDATE accounts SET balance = ? WHERE id = ?";
  db.run(sql, [balance, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Balance updated", id, newBalance: balance });
  });
});

app.listen(PORT, () => {
  console.log(`Account Service running on http://localhost:${PORT}`);
});

