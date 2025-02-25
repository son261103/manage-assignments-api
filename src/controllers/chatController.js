const Message = require('../models/Message');
const Class = require('../models/Class');
const User = require('../models/User');

// Send direct message or class announcement
const sendMessage = async (req, res) => {
    try {
        const { recipientId, classId, content, type = 'direct', attachments } = req.body;

        if (!classId || !content) {
            return res.status(400).json({ msg: 'Class ID and content are required' });
        }

        const class_ = await Class.findById(classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        if (recipientId) {
            const recipient = await User.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({ msg: 'Recipient not found' });
            }
        }

        const userIdStr = req.user.id.toString();
        const isTeacher = class_.teacher.toString() === userIdStr;
        const isStudent = class_.students.some(student => student.toString() === userIdStr);
        const isAdmin = req.user.isAdmin;

        if (!isTeacher && !isStudent && !isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Not in class' });
        }

        if (type === 'announcement' && !isTeacher && !isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Teachers only' });
        }

        const message = new Message({
            sender: req.user.id,
            recipient: recipientId || null,
            class: classId,
            content,
            type,
            attachments: attachments || []
        });

        await message.save();
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name') // Đảm bảo lấy đúng trường name
            .populate('recipient', 'name');
        res.status(201).json({ msg: 'Message sent successfully', data: populatedMessage });
    } catch (err) {
        console.error('Send message error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Get all messages in a class
const getMessages = async (req, res) => {
    try {
        const class_ = await Class.findById(req.params.classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        const userIdStr = req.user.id.toString();
        const isTeacher = class_.teacher.toString() === userIdStr;
        const isStudent = class_.students.some(student => student.toString() === userIdStr);
        const isAdmin = req.user.isAdmin;

        if (!isTeacher && !isStudent && !isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Not in class' });
        }

        const messages = await Message.find({ class: req.params.classId })
            .populate('sender', 'name') // Đảm bảo populate sender.name
            .populate('recipient', 'name')
            .sort({ createdAt: 1 });

        res.json({ data: messages });
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Các hàm khác giữ nguyên
const getConversation = async (req, res) => {
    try {
        const messages = await Message.find({
            type: 'direct',
            $or: [
                { sender: req.user.id, recipient: req.params.userId },
                { sender: req.params.userId, recipient: req.user.id }
            ]
        })
            .populate('sender', 'name')
            .populate('recipient', 'name')
            .sort({ createdAt: 1 });

        res.json({ data: messages });
    } catch (err) {
        console.error('Get conversation error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const { classId, content, attachments } = req.body;

        if (!classId || !content) {
            return res.status(400).json({ msg: 'Class ID and content are required' });
        }

        const class_ = await Class.findById(classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        const isTeacher = class_.teacher.toString() === req.user.id.toString();
        if (!isTeacher && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Teachers only' });
        }

        const announcement = new Message({
            sender: req.user.id,
            class: classId,
            content,
            type: 'announcement',
            attachments: attachments || []
        });

        await announcement.save();
        const populatedAnnouncement = await Message.findById(announcement._id)
            .populate('sender', 'name');
        res.status(201).json({ msg: 'Announcement created successfully', data: populatedAnnouncement });
    } catch (err) {
        console.error('Create announcement error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

const getClassAnnouncements = async (req, res) => {
    try {
        const class_ = await Class.findById(req.params.classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        const userIdStr = req.user.id.toString();
        const isTeacher = class_.teacher.toString() === userIdStr;
        const isStudent = class_.students.some(student => student.toString() === userIdStr);
        const isAdmin = req.user.isAdmin;

        if (!isTeacher && !isStudent && !isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Not in class' });
        }

        const announcements = await Message.find({
            class: req.params.classId,
            type: 'announcement'
        })
            .populate('sender', 'name')
            .sort({ createdAt: -1 });

        res.json({ data: announcements });
    } catch (err) {
        console.error('Get announcements error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        if (message.recipient && message.recipient.toString() !== req.user.id.toString()) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        message.read = true;
        await message.save();
        res.json({ msg: 'Message marked as read', data: message });
    } catch (err) {
        console.error('Mark as read error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        if (message.sender.toString() !== req.user.id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await message.deleteOne();
        res.json({ msg: 'Message deleted successfully' });
    } catch (err) {
        console.error('Delete message error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversation,
    createAnnouncement,
    getClassAnnouncements,
    markAsRead,
    deleteMessage
};