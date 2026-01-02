// =============================
// MODULE IMPORT
// =============================
const jwt = require('jsonwebtoken');
require('dotenv').config();


// =============================
// VERIFY TOKEN
// =============================

const verifyToken = (req, res, next) => {
    // Get token from header: authorzation.
    const authHeader = req.header('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ code: 'TOKEN_MISSING', message: 'Invalid Token.'});
    };

    const token = authHeader.split(' ')[1];

    try {
        // Validate token.
        const secretKey = process.env.JWT_SECRET;
        const payload = jwt.verify(token, secretKey);

        // Send Payload for next middleware.
        req.user = payload;
        next();

    } catch (error) {
        //Handle auth/token ERROR.
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return res.status(401).json({ code: 'TOKEN_MISSING_OR_EXPIRED', message: 'Invalid Token or Expired.'});
        };

        console.error('❌ Verity token ERROR: ', error);
        return res.status(500).json({ code: 'SERVER_ERROR', message: 'An unexpected server error.'});
    }
};


// =============================
// MODULE EXPORT
// =============================
module.exports = verifyToken;