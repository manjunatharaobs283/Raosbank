const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const app = express();
const PORT = 8082;

app.use(express.json());

// SQLite DB for transactions
const db = new sqlite3.Database("./transactions.db", (err) => {
  if (err) console.error("DB connection error:", err.message);
  else console.log("Connected to SQLite DB for transactions");
});

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accountId INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  createdAt TEXT NOT NULL,
  targetAccountId INTEGER
)
`);

// Helper to update account balance via Account Service
async function updateBalance(accountId, newBalance) {
  await axios.post(`http://localhost:8081/accounts/update`, { id: accountId, balance: newBalance });
}

// Deposit
app.post("/deposit", async (req, res) => {
  const { accountId, amount } = req.body;
  if (!accountId || !amount) return res.status(400).json({ error: "accountId and amount required" });

  try {
    const accountRes = await axios.get(`http://localhost:8081/accounts`);
    const account = accountRes.data.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const newBalance = account.balance + amount;
    await updateBalance(accountId, newBalance);

    const createdAt = new Date().toISOString();
    db.run("INSERT INTO transactions (accountId, type, amount, createdAt) VALUES (?, ?, ?, ?)", 
      [accountId, "deposit", amount, createdAt]);

    res.json({ message: "Deposit successful", newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Withdraw
app.post("/withdraw", async (req, res) => {
  const { accountId, amount } = req.body;
  if (!accountId || !amount) return res.status(400).json({ error: "accountId and amount required" });

  try {
    const accountRes = await axios.get(`http://localhost:8081/accounts`);
    const account = accountRes.data.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: "Account not found" });
    if (account.balance < amount) return res.status(400).json({ error: "Insufficient funds" });

    const newBalance = account.balance - amount;
    await updateBalance(accountId, newBalance);

    const createdAt = new Date().toISOString();
    db.run("INSERT INTO transactions (accountId, type, amount, createdAt) VALUES (?, ?, ?, ?)", 
      [accountId, "withdraw", amount, createdAt]);

    res.json({ message: "Withdrawal successful", newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfer
app.post("/transfer", async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  if (!fromAccountId || !toAccountId || !amount) return res.status(400).json({ error: "fromAccountId, toAccountId, and amount required" });

  try {
    const accountRes = await axios.get(`http://localhost:8081/accounts`);
    const fromAccount = accountRes.data.find(a => a.id === fromAccountId);
    const toAccount = accountRes.data.find(a => a.id === toAccountId);
    if (!fromAccount || !toAccount) return res.status(404).json({ error: "One or both accounts not found" });
    if (fromAccount.balance < amount) return res.status(400).json({ error: "Insufficient funds in sender account" });

    await updateBalance(fromAccountId, fromAccount.balance - amount);
    await updateBalance(toAccountId, toAccount.balance + amount);

    const createdAt = new Date().toISOString();
    db.run("INSERT INTO transactions (accountId, type, amount, createdAt, targetAccountId) VALUES (?, ?, ?, ?, ?)", 
      [fromAccountId, "transfer", amount, createdAt, toAccountId]);

    res.json({ message: "Transfer successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get transactions by accountId
app.get("/transactions/:accountId", (req, res) => {
  const accountId = req.params.accountId;
  db.all("SELECT * FROM transactions WHERE accountId=?", [accountId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Transaction Service running on http://localhost:${PORT}`);
});

