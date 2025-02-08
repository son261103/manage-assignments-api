const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware xác thực người dùng từ token
const protect = (req, res, next) => {
    let token;

    // Kiểm tra xem token có trong header không
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ Authorization header
            token = req.headers.authorization.split(' ')[1];

            // Xác thực token và lấy thông tin người dùng
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Gắn user vào request để dùng trong các route sau
            req.user = decoded;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({msg: 'Token is not valid'});
        }
    }

    // Nếu không có token
    if (!token) {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }
};

module.exports = protect;
