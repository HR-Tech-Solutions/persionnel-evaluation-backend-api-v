// =============================
// MODULE IMPORT
// =============================
const express = require('express');
const pool = require('../db.js');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken.js');


// =============================
// PROFILE
// =============================
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const myID = req.user.user_id;
        const selectUserDB = 'SELECT user_id, username, fullname, role FROM users WHERE user_id = ?';
        const [rows] = await pool.query(selectUserDB, [ myID ]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'profile_error',
                message: 'This user not found.'
            });
        };

        // Send data response
        return res.status(200).json({
            status: 'profile_success',
            message: 'Profile feched successful',
            data: rows
        });

    } catch(error) {
        console.error('❌ Error fetching user: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error.'
        });
    };
});


// ==================================================
// VIEW FEEDBACK (ความเห็นกรรมการ)
// ==================================================
router.get('/results', verifyToken, async (req, res) => {
    try {
        // 1. ดึง ID ผู้ถูกประเมินจาก Token
        const eID = req.user.user_id; 

        // 2. Query ดึงเฉพาะ Comment โดยไม่ JOIN (เร็วและสั้นที่สุด)
        const sql = `
            SELECT overall_comment
            FROM assignment
            WHERE evaluatee_id = ? 
            AND overall_comment IS NOT NULL
        `;

        const [rows] = await pool.query(sql, [eID]);

        // 3. ส่ง Response
        if (rows.length === 0) {
            return res.status(200).json({ 
                status: 'success', 
                message: 'No feedback yet.', 
                data: [] 
            });
        }

        return res.status(200).json({ 
            status: 'success', 
            message: 'Feedback fetched.',
            data: rows // ส่ง Array ของ Object { overall_comment: "..." }
        });

    } catch (error) {
        console.error('❌ Error fetching minimal feedback:', error);
        return res.status(500).json({ status: 'server_error', message: 'Server Error.' });
    }
});



// =============================
// MODULE EXPORT
// =============================
module.exports = router;