const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// Create assignment
const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, points, requirements, classId } = req.body;

        if (!classId) {
            return res.status(400).json({ msg: 'Class ID is required' });
        }

        const class_ = await Class.findById(classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const assignment = new Assignment({
            title,
            description,
            dueDate,
            points,
            requirements,
            class: classId
        });

        await assignment.save();

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
        const classId = req.params.classId;
        const class_ = await Class.findById(classId);
        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        const assignments = await Assignment.find({ class: classId })
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
        const { title, description, dueDate, points, requirements } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        const class_ = await Class.findById(assignment.class);
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (title) assignment.title = title;
        if (description) assignment.description = description;
        if (dueDate) assignment.dueDate = dueDate;
        if (points) assignment.points = points;
        if (requirements) assignment.requirements = requirements;

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

        const class_ = await Class.findById(assignment.class);
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        class_.assignments = class_.assignments.filter(
            (a) => a.toString() !== assignment._id.toString()
        );
        await class_.save();

        await Assignment.findByIdAndDelete(req.params.id);
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