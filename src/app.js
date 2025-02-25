const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');


dotenv.config(); // Load biến môi trường từ .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/messages', chatRoutes);
app.use('/api/v1/users', userRoutes);
// Route mặc định
app.get('/', (req, res) => {
    res.send('Welcome to the Assignment Management API');
});

module.exports = app;
