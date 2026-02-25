const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user || !req.user.isActive) {
                return res.status(401).json({ success: false, message: 'Account is inactive or not found' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Admin only' });
    }
};

const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Super Admin only' });
    }
};

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Teacher only' });
    }
};

const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Student only' });
    }
};

const teacherOrAdmin = (req, res, next) => {
    if (req.user && ['admin', 'superadmin', 'teacher'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Teacher or Admin only' });
    }
};

module.exports = {
    protect,
    adminOnly,
    superAdminOnly,
    teacherOnly,
    studentOnly,
    teacherOrAdmin
};
