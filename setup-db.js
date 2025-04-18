const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  }
  console.log("Connected to database");
  
  // Check if products table exists
  db.query("SHOW TABLES LIKE 'products'", (err, results) => {
    if (err) {
      console.error("Error checking for products table:", err);
      process.exit(1);
    }
    
    if (results.length === 0) {
      // Create products table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          image VARCHAR(255),
          category VARCHAR(100),
          rating DECIMAL(3, 1) DEFAULT 0,
          reviews INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.query(createTableSQL, (err) => {
        if (err) {
          console.error("Error creating products table:", err);
          process.exit(1);
        }
        console.log("Products table created successfully");
        
        // Insert some sample products
        const sampleProducts = [
          {
            name: "Premium Headphones",
            price: 199.99,
            image: "https://readdy.ai/api/search-image?query=premium%2520headphones%2520on%2520white%2520background&width=400&height=500&seq=1&orientation=squarish",
            category: "Electronics",
            rating: 4.5,
            reviews: 128
          },
          {
            name: "Designer Watch",
            price: 299.99,
            image: "https://readdy.ai/api/search-image?query=luxury%2520watch%2520on%2520white%2520background&width=400&height=500&seq=2&orientation=squarish",
            category: "Accessories",
            rating: 4.8,
            reviews: 95
          },
          {
            name: "Smart Fitness Band",
            price: 79.99,
            image: "https://readdy.ai/api/search-image?query=fitness%2520band%2520on%2520white%2520background&width=400&height=500&seq=3&orientation=squarish",
            category: "Electronics",
            rating: 4.2,
            reviews: 210
          }
        ];
        
        const insertSQL = "INSERT INTO products (name, price, image, category, rating, reviews) VALUES ?";
        const values = sampleProducts.map(product => [
          product.name,
          product.price,
          product.image,
          product.category,
          product.rating,
          product.reviews
        ]);
        
        db.query(insertSQL, [values], (err) => {
          if (err) {
            console.error("Error inserting sample products:", err);
          } else {
            console.log("Sample products inserted successfully");
          }
          
          // Create users table
          createUsersTable();
        });
      });
    } else {
      console.log("Products table already exists");
      createUsersTable();
    }
  });
});

// Function to create users table
function createUsersTable() {
  db.query("SHOW TABLES LIKE 'users'", (err, results) => {
    if (err) {
      console.error("Error checking for users table:", err);
      process.exit(1);
    }
    
    if (results.length === 0) {
      const createUsersTableSQL = `
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.query(createUsersTableSQL, (err) => {
        if (err) {
          console.error("Error creating users table:", err);
          process.exit(1);
        }
        console.log("Users table created successfully");
        
        // Create orders table
        createOrdersTable();
      });
    } else {
      console.log("Users table already exists");
      createOrdersTable();
    }
  });
}

// Function to create orders table
function createOrdersTable() {
  db.query("SHOW TABLES LIKE 'orders'", (err, results) => {
    if (err) {
      console.error("Error checking for orders table:", err);
      process.exit(1);
    }
    
    if (results.length === 0) {
      const createOrdersTableSQL = `
        CREATE TABLE orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          username VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      
      db.query(createOrdersTableSQL, (err) => {
        if (err) {
          console.error("Error creating orders table:", err);
          process.exit(1);
        }
        console.log("Orders table created successfully");
        
        // Create order_items table
        createOrderItemsTable();
      });
    } else {
      console.log("Orders table already exists");
      createOrderItemsTable();
    }
  });
}

// Function to create order_items table
function createOrderItemsTable() {
  db.query("SHOW TABLES LIKE 'order_items'", (err, results) => {
    if (err) {
      console.error("Error checking for order_items table:", err);
      process.exit(1);
    }
    
    if (results.length === 0) {
      const createOrderItemsTableSQL = `
        CREATE TABLE order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `;
      
      db.query(createOrderItemsTableSQL, (err) => {
        if (err) {
          console.error("Error creating order_items table:", err);
          process.exit(1);
        }
        console.log("Order_items table created successfully");
        
        // Close the connection
        db.end();
      });
    } else {
      console.log("Order_items table already exists");
      db.end();
    }
  });
} 