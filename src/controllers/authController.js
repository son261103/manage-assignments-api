const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Kiểm tra xem email đã tồn tại chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // Mã hóa mật khẩu trước khi lưu vào DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo người dùng mới
        const user = new User({
            name,
            email,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
        });

        // Lưu người dùng vào DB
        await user.save();

        // Kiểm tra xem có tài khoản admin nào không
        const adminExists = await User.findOne({ isAdmin: true });
        if (!adminExists) {
            // Nếu không có admin, tạo một tài khoản admin mặc định với mật khẩu "admin"
            const defaultAdminPassword = await bcrypt.hash('admin', salt); // Mã hóa mật khẩu của admin

            const defaultAdmin = new User({
                name: 'Admin',
                email: 'admin@example.com',
                password: defaultAdminPassword, // Mật khẩu đã mã hóa
                isAdmin: true,
            });

            // Lưu tài khoản Admin vào DB
            await defaultAdmin.save();
            return res.status(201).json({
                msg: 'Admin user created successfully',
                data: defaultAdmin,
            });
        }

        res.status(201).json({
            msg: 'User registered successfully',
            data: user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Đăng nhập và trả về JWT token cùng thông tin người dùng
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            msg: 'Login successful',
            token,
            data: user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { registerUser, loginUser };
