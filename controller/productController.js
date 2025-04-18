const db = require('../db');

exports.getAllProducts = (req, res) => {
  db.query('SELECT * FROM products ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: "Error loading products" });
    res.json(results);
  });
};

exports.createProduct = (req, res) => {
  const { name, price, image, category, rating, reviews } = req.body;
  
  // Validate required fields
  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }
  
  // Insert the new product into the database
  db.query(
    'INSERT INTO products (name, price, image, category, rating, reviews, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [name, price, image || null, category || null, rating || 0, reviews || 0],
    (err, result) => {
      if (err) {
        console.error("Error inserting product:", err);
        return res.status(500).json({ message: "Failed to add product" });
      }
      
      // Return the newly created product with its ID
      const newProduct = {
        id: result.insertId,
        name,
        price,
        image,
        category,
        rating,
        reviews,
        created_at: new Date()
      };
      
      res.status(201).json(newProduct);
    }
  );
};
