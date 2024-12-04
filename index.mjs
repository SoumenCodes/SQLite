import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";

const app = express();

app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database("./mydatabase.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, password TEXT NOT NULL)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, description TEXT NOT NULL, FOREIGN KEY(userId) REFERENCES users(id))"
  );
});

app.get("/", async (req, res) => {
  const query1 = "SELECT * FROM users";
  const query2 = "SELECT * FROM todos";

  try {
    const userData = await new Promise((resolve, reject) => {
      db.all(query1, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });

    const todoData = await new Promise((resolve, reject) => {
      db.all(query2, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });

    res
      .status(200)
      .json({ msg: "app is running ...", users: userData, todos: todoData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/user", (req, res) => {
  const { email, password } = req.body;
  const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
  db.run(query, [email, password], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, email, password });
  });
});

app.post("/addTodo", (req, res) => {
  const { userId, description } = req.body;
  const query = `INSERT INTO todos (userId, description) VALUES (?, ?)`;
  db.run(query, [userId, description], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, userId, description });
  });
});

app.listen(1234, () => {
  console.log("Server is running on port 1234");
});
