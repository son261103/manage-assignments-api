const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Get all users (Admin only)
const getUsers = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        const users = await User.find().select('-password');
        res.json({ data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Create a new user (Admin only)
const createUser = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { name, email, password, isAdmin } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin: isAdmin || false
        });

        await newUser.save();
        res.status(201).json({ msg: 'User created successfully', data: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Update user profile (Admin can update any user, user can update own profile)
const updateUserProfile = async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body;
        const user = await User.findById(req.params.id || req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Only admin or the user themselves can update
        if (req.user.id !== user.id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        if (req.user.isAdmin && typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

        await user.save();
        res.json({ msg: 'Profile updated successfully', data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUserProfile,
    createUser,
    updateUserProfile,
    deleteUser
};