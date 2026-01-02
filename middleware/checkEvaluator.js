module.exports = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'auth_error',
            message: 'Unauthorized.'
        });
    };

    if (req.user.role === 'evaluator' || req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            status: 'access_denied',
            message: 'Access denied. only evaluator.'
        });
    };
};