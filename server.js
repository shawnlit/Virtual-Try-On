const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'virtual_tryon',
  password: 'yourpassword',
  port: 5432,
});

/* SIGNUP */
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    res.status(500).send("Error signing up");
  }
});

/* LOGIN */
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json("User not found");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json("Incorrect password");
    }

    res.json("Login successful");
  } catch (err) {
    res.status(500).send("Error logging in");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
