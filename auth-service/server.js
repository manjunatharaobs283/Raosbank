const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 8083;

app.use(express.json());

const SECRET_KEY = "raosbank_secret_key";

// SQLite DB for users
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error("DB connection error:", err.message);
  else console.log("Connected to SQLite DB for users");
});

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`);

// Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
    if (err) return res.status(400).json({ error: "Username already exists" });
    res.json({ message: "User created", userId: this.lastID });
  });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  db.get("SELECT * FROM users WHERE username=?", [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token required" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Protected test route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is protected data", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});

