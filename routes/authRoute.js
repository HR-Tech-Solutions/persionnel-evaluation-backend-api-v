// =============================
// MODULE IMPORT
// =============================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../db.js');


// =============================
// REGISTER ROUTE
// =============================
router.post('/register', async (req, res) => {
    // Read input.
    const { username, password, fullname, role } = req.body;

    // Validate input.
    if (!username || !password || !fullname || !role) {
        return res.status(400).json({
            code: 'REGISTER_INVALID_INPUT',
            message: 'Please provide username, password, fullname and role.'
        });
    };

    // Validate username.
    if (username.length < 5 || username.length > 20) {
        return res.status(400).json({
            code: 'REGISTER_ERROR_LENGHT',
            message: 'Username must have more than 5 and less more than 20 charactors.'
        });
    };

    const charactorPatern = /^[a-zA-Z0-9_-]+$/;
    if (!username.match(charactorPatern)) {
        return res.status(400).json({
            code: 'REGISTER_ERROR_INVALID_FORMAT',
            message: 'Username must be only contain English letters and Number.'
        });
    };

    if (username.includes(' ')) {
        return res.status(400).json({
            code: 'REGISTER_ERROR_INVALID_FORMAT',
            message: "Username shouldn't have spaces."
        });
    };

    const reservedWords = ['admin', 'root', 'superadmin', 'support'];
    const usernameLower = username.toLowerCase();

    if (reservedWords.includes(usernameLower)) {
        return res.status(400).json({
            code: 'REGISTER_ERROR_INVALID_WORDS',
            message: "Username shouldn't be " + usernameLower + "."
        });
    };

    // Validate fullname.
    const nameRegex = /^[a-zA-Zก-ฮะ-์\s]+$/; 
    if (fullname.trim().length < 3 || !nameRegex.test(fullname)) {
        return res.status(400).json({ 
            code: 'FULLNAME_ERROR_INVALID',
            message: 'The first and last name is incorrect (must be at least 3 characters long and contain no numbers).'
         });
    };

    // Validate password.
    if (password.length < 8 || 
        !/[A-Z]/.test(password) || 
        !/[a-z]/.test(password) || 
        !/[0-9]/.test(password)) {
        return res.status(400).json({ 
            code: 'PASSWORD_ERROR_INVALID',
            message: 'Passwords must be at least 8 characters long and contain uppercase letters, lowercase letters, and numbers.' 
        });
    }

    // Validate role.
    const validRoles = ['ADMIN', 'EVALUATOR', 'USER'];
    if (!validRoles.includes(role.toUpperCase())) {
        return res.status(400).json({
            code: 'ROLE_ERROR_INVALID', 
            message: 'Invalid Role.' 
        });
    };


    try {
        // Insert user to database with hashed password.
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserDB = 'INSERT INTO users(username, password, fullname, role) VALUES(?, ?, ?, ?)';
        await pool.query(insertUserDB, [ username.trim(), hashedPassword, fullname.trim(), role ]);

        // Send response
        return res.status(201).json({
            code: 'REGISTER_SUCCESS',
            message: 'User creating successfully!'
        });

    } catch(error) {
        // Check for duplicate.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'REGISTER_ERROR_USER_ALREADY_EXSITS',
                message: 'This user is already exists.'
            });
        };

        console.error('❌ Error creating user: ', error);
        return res.status(500).json({
            code: 'SERVER_ERROR',
            message: 'An unexpected server error. Please try again later.'
        });
    };
});



// =============================
// LOGIN ROUTE
// =============================
router.post('/login', async (req,res) => {
    // Read input
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            status: 'login_error',
            message: 'Please provide username and password.'
        });
    };

    try {
        // Select user from database
        const selectUserDB = 'SELECT user_id, username, password, fullname, role FROM users WHERE username = ?';
        const [rows] = await pool.query(selectUserDB, [ username ]);

        if (rows.length === 0) {
            return res.status(400).json({
                status: 'login_error',
                message: 'Invalid username or password.'
            });
        };

        const userDB = rows[0];

        // Mached password.
        const matchedPassword = await bcrypt.compare(password.trim(), userDB.password);

        if (!matchedPassword) {
            return res.status(400).json({
                status: 'login_error',
                message: 'Invalid username or password'
            });
        };

        // Payload of JWT token.
        const payload = {
            user_id: userDB.user_id,
            username: userDB.username,
            fullname: userDB.fullname,
            role: userDB.role
        };

        const secretKey = process.env.JWT_SECRET;
        const encodedPayload = jwt.sign(payload, secretKey, {expiresIn: '1h'});

        // Send data response
        return res.status(200).json({
            status: 'login_success',
            message: 'Login successfully!',
            data: {
                token: encodedPayload,
                user: payload
            }
        });

    } catch(error) {
        console.error('❌ Error during login: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error. Please try again later.'
        });
    };
});



// =============================
// MODULE EXPORT
// =============================
module.exports = router;