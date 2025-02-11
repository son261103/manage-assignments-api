const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        points: {
            type: Number,
            required: true,
            default: 100
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileType: String
        }],
        submissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Submission'
        }]
    },
    { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;