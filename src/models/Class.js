const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        assignments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment'
        }]
    },
    { timestamps: true }
);

const Class = mongoose.model('Class', classSchema);

module.exports = Class;