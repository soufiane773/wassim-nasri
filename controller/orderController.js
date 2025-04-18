const db = require('../db');

exports.saveOrder = async (req, res) => {
  console.log('Starting saveOrder function');
  console.log('Session data:', req.session);
  console.log('Cart data:', req.body.cart);

  if (!req.session.user_id || !req.session.username) {
    console.log('User not logged in, returning 403');
    return res.status(403).json({ error: 'User not logged in' });
  }

  const { cart } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    console.log('Invalid cart data, returning 400');
    return res.status(400).json({ error: 'Invalid cart data' });
  }

  let connection;
  try {
    console.log('Getting database connection');
    connection = await db.getConnection();
    console.log('Starting transaction');
    await connection.beginTransaction();

    // Insert order
    console.log('Inserting order for user:', req.session.user_id);
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, username) VALUES (?, ?)',
      [req.session.user_id, req.session.username]
    );
    const orderId = orderResult.insertId;
    console.log('Order created with ID:', orderId);

    // Insert order items
    console.log('Inserting order items');
    for (const item of cart) {
      console.log('Processing item:', item);
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    console.log('Committing transaction');
    await connection.commit();
    console.log('Transaction committed successfully');

    res.json({ 
      success: true, 
      message: 'Order placed successfully',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error in saveOrder:', error);
    if (connection) {
      console.log('Rolling back transaction');
      await connection.rollback();
    }
    res.status(500).json({ 
      error: 'Failed to place order',
      details: error.message
    });
  } finally {
    if (connection) {
      console.log('Releasing connection');
      connection.release();
    }
  }
};

exports.getAllOrders = (req, res) => {
  const sql = `
    SELECT o.id AS order_id, u.username, u.email, o.created_at, oi.product_id, oi.quantity
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.getUserOrders = (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.status(403).json({ message: "Not logged in" });
  }

  const sql = `
    SELECT 
      o.id AS order_id, 
      o.created_at, 
      oi.product_id, 
      oi.quantity,
      oi.price,
      p.name AS product_name,
      p.image AS product_image
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("🔥 DB Error in getUserOrders:", err.sqlMessage || err);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }

    res.json(results);
  });
};



