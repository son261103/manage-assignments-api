const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Sửa từ true thành false
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileType: String
        }],
        read: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: ['direct', 'announcement'],
            default: 'direct'
        }
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;