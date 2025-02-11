const Class = require('../models/Class');
const User = require('../models/User');

// Create a new class
const createClass = async (req, res) => {
    try {
        const { name, description, code } = req.body;

        // Only teachers or admins can create classes
        if (!req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const classExists = await Class.findOne({ code });
        if (classExists) {
            return res.status(400).json({ msg: 'Class code already exists' });
        }

        const newClass = new Class({
            name,
            description,
            code,
            teacher: req.user.id
        });

        await newClass.save();
        res.status(201).json({ msg: 'Class created successfully', data: newClass });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get all classes
const getClasses = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('teacher', 'name email')
            .populate('students', 'name email');
        res.json({ data: classes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get class by ID
const getClassById = async (req, res) => {
    try {
        const class_ = await Class.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate('students', 'name email')
            .populate('assignments');

        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        res.json({ data: class_ });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Update class
const updateClass = async (req, res) => {
    try {
        const { name, description } = req.body;
        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        // Only teacher of the class or admin can update
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (name) class_.name = name;
        if (description) class_.description = description;

        await class_.save();
        res.json({ msg: 'Class updated successfully', data: class_ });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Delete class
const deleteClass = async (req, res) => {
    try {
        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        // Only teacher of the class or admin can delete
        if (class_.teacher.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await class_.remove();
        res.json({ msg: 'Class deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Add student to class
const addStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        // Check if student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Check if student is already in class
        if (class_.students.includes(studentId)) {
            return res.status(400).json({ msg: 'Student already in class' });
        }

        class_.students.push(studentId);
        await class_.save();

        res.json({ msg: 'Student added successfully', data: class_ });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Remove student from class
const removeStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const class_ = await Class.findById(req.params.id);

        if (!class_) {
            return res.status(404).json({ msg: 'Class not found' });
        }

        class_.students = class_.students.filter(
            student => student.toString() !== studentId
        );

        await class_.save();
        res.json({ msg: 'Student removed successfully', data: class_ });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass,
    addStudent,
    removeStudent
};