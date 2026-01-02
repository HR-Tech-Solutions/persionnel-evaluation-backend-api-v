// =============================
// MODULE IMPORT
// =============================
const express = require('express');
const router = express.Router();

const pool = require('../db.js');
const verifyToken = require('../middleware/verifyToken.js');
const checkAdmin = require('../middleware/checkAdmin.js');


// =============================
// PERIOD MENAGEMENT
// =============================
// -----------------------------
//          [ POST ]
// -----------------------------
router.post('/period', verifyToken, checkAdmin, async (req, res) => {
    // Read input
    const { period_name, start_date, end_date } = req.body;

    // Validate input
    if (!period_name || !start_date || !end_date) {
        return res.status(400).json({
            status: 'period_error',
            message: 'Please provide period_name, start_date and end_date.'
        });
    };

    try {
        // Insert period into database.
        const insertPerioDB = "INSERT INTO evaluation_period (period_name, start_date, end_date, status) VALUES (?, ?, ?, \'active\')";
        await pool.query(insertPerioDB, [ period_name.trim(), start_date, end_date ]);

        // Send response
        return res.status(201).json({
            status: 'period_success',
            message: 'Period created successfully!'
        });

    } catch(error) {
        console.error('❌ Error creating period: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error: Please try again later.'
        });
    };
});

// -----------------------------
//          [ GET ]
// -----------------------------
router.get('/period', verifyToken, checkAdmin, async (req, res) => {
    try {
        // Select period from database.
        const selectPeriodDB = 'SELECT period_id, period_name, start_date, end_date, status FROM evaluation_period';
        const [rows] = await pool.query(selectPeriodDB);

        // Send data response
        return res.status(200).json({
            status: 'period_success',
            message: 'Period fetched successfully!',
            data: rows
        });

    } catch(error) {
        console.error('❌ Error fetched period: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error.'
        });
    };
});


// =============================
// INDICATOR MENAGEMENT
// =============================
// -----------------------------
//          [ POST ]
// -----------------------------
router.post('/indicators', verifyToken, checkAdmin, async (req, res) => {
    // Read input.
    const { indicator_name, description, weight, eval_type, period_id } = req.body;

    // Validate input,
    if (!indicator_name || !weight || !eval_type || !period_id) {
        return res.status(400).json({
            status: 'indicator_error',
            message: 'Please provide indicator_name, weight, eval_type and period_id.'
        });
    };

    // Validate description
    const final_descriptinon = (description && typeof description === 'string') ? description.trim() : null;

    try {
        // Insert indicator into database.
        const insertIndicatorDB = 'INSERT INTO indicator (indicator_name, description, weight, eval_type, period_id) VALUES (?, ?, ?, ?, ?)';
        await pool.query(insertIndicatorDB, [ indicator_name.trim(), final_descriptinon, weight, eval_type, period_id ]);

        // Send response
        return res.status(201).json({
            status: 'indicator_success',
            message: 'Indicator created successfully!'
        });

    } catch (error) {
        console.error('❌ Error creating indicator: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error. Please try again later.'
        });
    };
});

// -----------------------------
//          [ GET ]
// -----------------------------
router.get('/indicator', verifyToken, checkAdmin, async (req, res) => {
    try {
        // select indicator from database.
        const selectIndicatorDB = 'SELECT i.indicator_id, i.indicator_name, i.description, i.weight, i.eval_type, p.period_id ' +
                                  'FROM indicator i ' +
                                  'JOIN evaluation_period p ON i.period_id = p.period_id ' +
                                  'ORDER BY i.period_id DESC, i.indicator_id ASC';

        const [rows] = await pool.query(selectIndicatorDB);

        // Send data response
        return res.status(200).json({
            status: 'indicator_success',
            message: 'Indicator fetched successfully!',
            data: rows
        });

    } catch(error) {
        console.error('❌ Error fetched indicator: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error.'
        });
    };
});



// =============================
// ASSIGNMENT MENAGEMENT
// =============================
// -----------------------------
//          [ POST ]
// -----------------------------
router.post('/assignment', verifyToken, checkAdmin, async (req, res) => {
    // Read input
    const { evaluator_id, evaluatee_id, period_id, role } = req.body;

    // Validate input
    if (!evaluator_id || !evaluatee_id || !period_id || !role ) {
        return res.status(400).json({
            status: 'assignment_error',
            message: 'Missing required feilds.'
        });
    };

    try {
        // Check for duplicate.
        const checkAssDC = 'SELECT assignment_id FROM assignment ' +
                           'WHERE evaluator_id = ? AND evaluatee_id = ? AND period_id = ?';

        const [exists] = await pool.query(checkAssDC, [ evaluator_id, evaluatee_id, period_id ]);

        if (exists.lenght > 0) {
            return res.status(409).json({
                status: 'assignment_error',
                message: 'This assignment already exists.'
            });
        };

        // Insert assignment into database.
        const insertAssDB = 'INSERT INTO assignment (evaluator_id, evaluatee_id, period_id, role) VALUES (?, ?, ?, ?) ';
        await pool.query(insertAssDB, [ evaluator_id, evaluatee_id, period_id, role ]);

        // Send response.
        return res.status(201).json({
            status: 'assignment_success',
            message: 'Assignment created successfully!'
        });

    } catch(error) {
        console.error('❌ Error creating assginment: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error'
        });
    };
});



// -----------------------------
//          [ GET ]
// -----------------------------
router.get('/assignment', verifyToken, checkAdmin, async (req, res) => {
    try {
        // Select assignment from database.
        const selectAssDB = "SELECT user_id, username, fullname, role FROM users WHERE role != 'admin'";
        const [rows] = await pool.query(selectAssDB);

        // Send data response
        return res.status(200).json({
            status: 'assignment_success',
            message: 'Assignment fetched successfully!',
            data: rows
        });

    } catch (error) {
        console.error('❌ Error fething assignment: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error.'
        });
    };
});

// =============================
// MODULE EXPORT
// =============================
module.exports = router;