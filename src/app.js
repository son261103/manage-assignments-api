const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');  // Đảm bảo đã có file này


dotenv.config(); // Load biến môi trường từ .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Route mặc định
app.get('/', (req, res) => {
    res.send('Welcome to the Assignment Management API');
});

module.exports = app;
