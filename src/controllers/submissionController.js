const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// Create submission
const createSubmission = async (req, res) => {
    try {
      const { assignmentId, content, attachments, studentId, grade, feedback } = req.body;
      const assignment = await Assignment.findById(assignmentId);
  
      if (!assignment) {
        return res.status(404).json({ msg: 'Assignment not found' });
      }
  
      const class_ = await Class.findById(assignment.class);
      const submittingStudentId = studentId || req.user.id;
      if (!class_.students.includes(submittingStudentId) && !req.user.isAdmin) {
        return res.status(403).json({ msg: 'Not authorized - You are not in this class' });
      }
  
      let submission = await Submission.findOne({
        assignment: assignmentId,
        student: submittingStudentId
      });
  
      if (submission) {
        submission.content = content || submission.content;
        submission.attachments = attachments || submission.attachments;
        submission.grade = grade || submission.grade;
        submission.feedback = feedback || submission.feedback;
        submission.status = grade ? 'graded' : (new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted');
        await submission.save();
        return res.json({ msg: 'Submission updated successfully', data: submission });
      }
  
      submission = new Submission({
        student: submittingStudentId,
        assignment: assignmentId,
        content,
        attachments,
        grade,
        feedback,
        status: grade ? 'graded' : (new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted')
      });
  
      await submission.save();
  
      assignment.submissions.push(submission._id);
      await assignment.save();
  
      res.status(201).json({ msg: 'Submission created successfully', data: submission });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

// Get student's submission for an assignment
const getStudentSubmission = async (req, res) => {
    try {
        const submission = await Submission.findOne({
            assignment: req.params.assignmentId,
            student: req.user.id
        }).populate('assignment');

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        res.json({ data: submission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get all submissions for an assignment (teacher only)
const getAssignmentSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        const class_ = await Class.findById(assignment.class);
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Teachers only' });
        }

        const submissions = await Submission.find({ 
            assignment: req.params.assignmentId 
        })
            .populate('student', 'name email')
            .populate('assignment', 'title dueDate points');

        res.json({ data: submissions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Update submission
const updateSubmission = async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        if (submission.student.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized - Not your submission' });
        }

        const assignment = await Assignment.findById(submission.assignment);
        if (new Date() > new Date(assignment.dueDate)) {
            submission.status = 'late';
        }

        submission.content = content || submission.content;
        if (attachments) {
            submission.attachments = attachments;
        }

        await submission.save();
        res.json({ msg: 'Submission updated successfully', data: submission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Grade submission (teacher only)
const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findById(req.params.id)
            .populate('assignment');

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        const class_ = await Class.findById(submission.assignment.class);
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized - Teachers only' });
        }

        if (grade < 0 || grade > submission.assignment.points) {
            return res.status(400).json({ 
                msg: `Grade must be between 0 and ${submission.assignment.points}` 
            });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';

        await submission.save();
        res.json({ msg: 'Submission graded successfully', data: submission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Delete submission
const deleteSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        if (submission.student.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const assignment = await Assignment.findById(submission.assignment);
        assignment.submissions = assignment.submissions.filter(
            sub => sub.toString() !== submission._id.toString()
        );
        await assignment.save();

        await Submission.findByIdAndDelete(req.params.id); // Sửa từ .remove()
        res.json({ msg: 'Submission deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = {
    createSubmission,
    getStudentSubmission,
    getAssignmentSubmissions,
    updateSubmission,
    gradeSubmission,
    deleteSubmission
};