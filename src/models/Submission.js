const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        content: {
            type: String,
        },
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileType: String
        }],
        grade: {
            type: Number,
            min: 0,
            max: 100
        },
        feedback: {
            type: String
        },
        status: {
            type: String,
            enum: ['submitted', 'graded', 'late'],
            default: 'submitted'
        }
    },
    { timestamps: true }
);

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;