const express = require('express');
const router = express.Router();
const {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass,
    addStudent,
    removeStudent
} = require('../controllers/classController');
const protect = require('../middleware/authMiddleware');

// Áp dụng middleware protect cho tất cả các routes
router.use(protect);

// Routes CRUD cơ bản
router.post('/', createClass);  // Tạo lớp mới
router.get('/', getClasses);    // Lấy danh sách lớp

router.route('/:id')
    .get(getClassById)    // Lấy thông tin chi tiết lớp
    .put(updateClass)     // Cập nhật thông tin lớp
    .delete(deleteClass); // Xóa lớp
// Routes quản lý học sinh
router.post('/:id/students/add', addStudent);    
router.post('/:id/students/remove', removeStudent);
module.exports = router;