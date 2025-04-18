const express = require('express');
const router = express.Router();
const { register, login, logout, checkLogin } = require('../controller/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-login', checkLogin);

module.exports = router;


