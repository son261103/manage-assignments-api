const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// Create assignment
const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, points, classId } = req.body;

        // Check if class exists
        const class_ = await Class.findById(classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        // Only teacher of the class can create assignments
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const assignment = new Assignment({
            title,
            description,
            dueDate,
            points,
            class: classId
        });

        await assignment.save();

        // Add assignment to class
        class_.assignments.push(assignment._id);
        await class_.save();

        res.status(201).json({ msg: 'Assignment created successfully', data: assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get all assignments for a class
const getClassAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ class: req.params.classId })
            .populate('submissions');
        res.json({ data: assignments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get assignment by ID
const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('submissions');

        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        res.json({ data: assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Update assignment
const updateAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, points } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        // Check class teacher
        const class_ = await Class.findById(assignment.class);
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (title) assignment.title = title;
        if (description) assignment.description = description;
        if (dueDate) assignment.dueDate = dueDate;
        if (points) assignment.points = points;

        await assignment.save();
        res.json({ msg: 'Assignment updated successfully', data: assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        // Check class teacher
        const class_ = await Class.findById(assignment.class);
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Remove assignment from class
        class_.assignments = class_.assignments.filter(
            a => a.toString() !== assignment._id.toString()
        );
        await class_.save();

        await assignment.remove();
        res.json({ msg: 'Assignment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = {
    createAssignment,
    getClassAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
};
