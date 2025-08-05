const bcrypt = require('bcryptjs');
const db = require('../db');

exports.register = async (req, res) => {
  console.log("➡️ Register Request:", req.body);

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    console.error(" Missing fields:", { username, email, password });
    return res.status(400).json({ message: "All fields are required." });
  }

  const hash = await bcrypt.hash(password, 10);

  db.query('SELECT * FROM users WHERE name = ?', [username], (err, result) => {
    if (err) {
      console.error("Database error during registration:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  
    if (result.length > 0) {
      return res.json({ message: "Username already exists" });
    }
  
    db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash],
      (err2) => {
        if (err2) {
          console.error("Error inserting user:", err2);
          return res.status(500).json({ message: "Failed to register user" });
        }
  
        return res.json({ message: "User registered successfully" });
      }
    );
  });
};

exports.login = (req, res) => {
  console.log("➡️ Login Request:", { username: req.body.username, password: req.body.password ? "***" : "missing" });
  console.log("Session before login:", req.session);

  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE name = ?', [username], async (err, result) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      console.log("Login failed: User not found");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("Login failed: Password mismatch");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    req.session.user_id = user.id;
    req.session.username = user.username;
    req.session.admin = user.is_admin === 1;

    console.log("Login successful:", user.username, "Admin:", req.session.admin);
    console.log("Session after login:", req.session);
    console.log("Session ID:", req.sessionID);
    console.log("Cookie:", req.headers.cookie);

    return res.json({
      message: "Login successful",
      isAdmin: req.session.admin,
      username: user.username
    });
  });
};

exports.logout = (req, res) => {
  console.log("➡️ Logout Request");
  console.log("Session before logout:", req.session);
  
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed." });
    }
    console.log("Session destroyed successfully");
    res.clearCookie('connect.sid'); 
    res.json({ message: "Logged out successfully." });
  });
};

exports.checkLogin = (req, res) => {
  console.log("➡️ Check Login Request");
  console.log("Session ID:", req.sessionID);
  console.log("Cookie:", req.headers.cookie);
  console.log("Session:", req.session);
  
  if (req.session.user_id && req.session.username) {
    console.log("User is logged in:", req.session.username);
    return res.json({
      loggedIn: true,
      username: req.session.username,
      isAdmin: req.session.admin || false
    });
  } else {
    console.log("User is not logged in");
    return res.json({
      loggedIn: false,
      message: "Not logged in"
    });
  }
};


