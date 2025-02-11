const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessages,
    getConversation,
    createAnnouncement,
    getClassAnnouncements,
    markAsRead,
    deleteMessage
} = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

// Áp dụng middleware protect
router.use(protect);

// Routes tin nhắn trực tiếp
router.post('/send', sendMessage);                      // Gửi tin nhắn
router.get('/conversation/:userId', getConversation);   // Lấy cuộc trò chuyện với một người dùng
router.get('/class/:classId', getMessages);            // Lấy tin nhắn của một lớp

// Routes thông báo
router.post('/announcement', createAnnouncement);             // Tạo thông báo
router.get('/announcements/:classId', getClassAnnouncements); // Lấy danh sách thông báo của lớp

// Routes quản lý tin nhắn
router.put('/:id/read', markAsRead);     // Đánh dấu đã đọc
router.delete('/:id', deleteMessage);     // Xóa tin nhắn

module.exports = router;