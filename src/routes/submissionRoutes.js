const express = require('express');
const router = express.Router();
const {
    createSubmission,
    getStudentSubmission,
    getAssignmentSubmissions,
    updateSubmission,
    gradeSubmission,
    deleteSubmission
} = require('../controllers/submissionController');
const protect = require('../middleware/authMiddleware');

// Áp dụng middleware protect
router.use(protect);

// Routes quản lý bài nộp
router.post('/', createSubmission);                              // Nộp bài
router.get('/student/:assignmentId', getStudentSubmission);      // Lấy bài nộp của học sinh
router.get('/assignment/:assignmentId', getAssignmentSubmissions); // Lấy tất cả bài nộp của một bài tập

router.route('/:id')
    .put(updateSubmission)     // Cập nhật bài nộp
    .delete(deleteSubmission); // Xóa bài nộp

// Route chấm điểm
router.post('/:id/grade', gradeSubmission); // Chấm điểm bài nộp

module.exports = router;

