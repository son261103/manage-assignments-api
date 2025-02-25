const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getClassAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
} = require('../controllers/assignmentController');
const protect = require('../middleware/authMiddleware');

// Áp dụng middleware protect
router.use(protect);

// Routes CRUD cho bài tập
router.post('/', createAssignment);                // Tạo bài tập mới
router.get('/classes/:classId/assignments', getClassAssignments); // Sửa route cho đồng bộ với frontend

router.route('/:id')
    .get(getAssignmentById)    // Lấy chi tiết bài tập
    .put(updateAssignment)     // Cập nhật bài tập
    .delete(deleteAssignment); // Xóa bài tập

module.exports = router;