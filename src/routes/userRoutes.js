const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserProfile, 
  createUser, 
  updateUserProfile, 
  deleteUser 
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

// Lấy danh sách tất cả người dùng (chỉ admin)
router.get('/', protect, getUsers);

// Tạo người dùng mới (chỉ admin)
router.post('/', protect, createUser);

// Cập nhật thông tin người dùng (admin hoặc chính người dùng)
router.put('/:id', protect, updateUserProfile);

// Xóa người dùng (chỉ admin)
router.delete('/:id', protect, deleteUser);

module.exports = router;