const Message = require('../models/Message');
const Class = require('../models/Class');
const User = require('../models/User');

// Send direct message or class announcement
const sendMessage = async (req, res) => {
    try {
        const { recipientId, classId, content, type, attachments } = req.body;

        // Validate recipient or class exists
        if (type === 'direct') {
            const recipient = await User.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({ msg: 'Recipient not found' });
            }
        } else {
            const class_ = await Class.findById(classId);
            if (!class_) {
                return res.status(404).json({ msg: 'Class not found' });
            }

            // Only teacher can send announcements
            if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({ msg: 'Not authorized - Teachers only' });
            }
        }

        const message = new Message({
            sender: req.user.id,
            recipient: recipientId,
            class: classId,
            content,
            type,
            attachments
        });

        await message.save();
        res.status(201).json({ msg: 'Message sent successfully', data: message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get conversation between two users
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
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get all messages in a class
const getMessages = async (req, res) => {
    try {
        // Verify user is in class
        const class_ = await Class.findById(req.params.classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        if (class_.teacher.toString() !== req.user.id && 
            !class_.students.includes(req.user.id) && 
            !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Not in class' });
        }

        const messages = await Message.find({
            class: req.params.classId
        })
            .populate('sender', 'name')
            .populate('recipient', 'name')
            .sort({ createdAt: 1 });

        res.json({ data: messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Create class announcement
const createAnnouncement = async (req, res) => {
    try {
        const { classId, content, attachments } = req.body;

        // Verify teacher permission
        const class_ = await Class.findById(classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Teachers only' });
        }

        const announcement = new Message({
            sender: req.user.id,
            class: classId,
            content,
            type: 'announcement',
            attachments
        });

        await announcement.save();
        res.status(201).json({ 
            msg: 'Announcement created successfully', 
            data: announcement 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get class announcements
const getClassAnnouncements = async (req, res) => {
    try {
        // Verify user is in class
        const class_ = await Class.findById(req.params.classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        if (class_.teacher.toString() !== req.user.id && 
            !class_.students.includes(req.user.id) && 
            !req.user.isAdmin) {
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
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Mark message as read
const markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        // Only recipient can mark as read
        if (message.recipient && message.recipient.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        message.read = true;
        await message.save();

        res.json({ msg: 'Message marked as read', data: message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Delete message
const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        // Only sender can delete message
        if (message.sender.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await message.remove();
        res.json({ msg: 'Message deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
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