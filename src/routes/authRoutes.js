const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Đăng ký người dùng mới
router.post('/register', registerUser);

// Đăng nhập người dùng và nhận token
router.post('/login', loginUser);

// Kiểm tra xác thực token
router.get('/profile', protect, (req, res) => {
    res.json({ message: 'Profile data', user: req.user });
});

module.exports = router;
