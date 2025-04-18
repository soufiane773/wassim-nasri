const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');
const productRoutes = require('./routes/product');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(session({
  secret: 'super-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static('public'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/order', require('./routes/order'));
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
