const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  points: { type: Number, required: true },
  requirements: { type: String },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);