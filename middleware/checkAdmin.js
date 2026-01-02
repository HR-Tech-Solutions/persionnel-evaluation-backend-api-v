module.exports = (req, res, next) => {
    if (!req.user.role || req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'role_error',
            message: 'Access denied. only admin.'
        });
    };
    next();
};