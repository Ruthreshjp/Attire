module.exports = function (req, res, next) {
    // Check if user has admin role (role: 1)
    if (req.user && req.user.role === 1) {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
};
