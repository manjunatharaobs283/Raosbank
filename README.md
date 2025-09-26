# RaosBank Microservices Project

A simple **banking application** built using **Node.js, Express, and SQLite**, structured as **microservices**, with a browser-based frontend.

This project demonstrates **microservices architecture**, **persistent storage**, and interaction between services via HTTP APIs.

---

## 🏗️ Project Structure

```
RaosBank/
├─ account-service/       # Service to manage accounts
├─ transaction-service/   # Service to handle deposits, withdrawals, transfers, and transaction history
├─ frontend/              # Browser-based frontend
├─ README.md
```

---

## 💾 Technologies Used

* **Node.js** and **Express.js** – for building REST APIs
* **SQLite** – persistent storage for accounts and transactions
* **Axios** – HTTP client for service-to-service communication
* **HTML/JS** – frontend for interacting with services
* **NPM** – package management
* **Git/GitHub** – version control and project hosting

---

## 🔹 Account Service

* **Port:** `8081`
* **Persistent storage:** SQLite (`accounts.db`)
* **APIs:**

  * `GET /accounts` → Get all accounts
  * `POST /accounts` → Create a new account
  * `POST /accounts/update` → Update account balance (used by Transaction Service)

---

## 🔹 Transaction Service

* **Port:** `8082`

* **Persistent storage:** SQLite (`transactions.db`)

* **APIs:**

  * `POST /deposit` → Deposit money into an account
  * `POST /withdraw` → Withdraw money from an account
  * `POST /transfer` → Transfer money between accounts
  * `GET /transactions/:accountId` → Get transaction history for an account

* Communicates with **Account Service** to update balances.

---

## 🔹 Frontend

* Simple **HTML + JS interface** served locally
* **Features:**

  * Create accounts
  * View all accounts
  * Deposit, withdraw, transfer
  * View transaction history
* Frontend fetches data from **Account Service** and **Transaction Service**

---

## ⚡ Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/RaosBank.git
cd RaosBank
```

2. **Install dependencies for services**

```bash
cd account-service
npm install
cd ../transaction-service
npm install
```

3. **Start services**

```bash
# Terminal 1: Account Service
cd account-service
node server.js

# Terminal 2: Transaction Service
cd transaction-service
node server.js
```

4. **Start frontend**

```bash
cd frontend
npx serve .
```

5. Open browser at the address shown (e.g., `http://localhost:46117`)

---

## 📝 Notes

* Both services must be **running simultaneously** for transactions to work.
* Accounts and transactions are **stored persistently in SQLite**, so data survives server restarts.
* The frontend currently does not include advanced error handling or styling; this can be enhanced in future iterations.

---

## 🚀 Future Improvements

* Better **frontend UI/UX** with validation and error messages
* Add **user authentication**
* Add **logging and monitoring** for microservices
* Dockerize services for easier deployment
* Add **unit tests** for API endpoints

---

## 📄 License

This project is **open-source**. Feel free to use, modify, or extend it.
