// =============================
// MODULE IMPORT
// =============================
const express = require('express');
const router = express.Router();

const pool = require('../db.js');
const verifyToken = require('../middleware/verifyToken.js');
const checkEvaluator = require('../middleware/checkEvaluator.js');

// =============================
// GET ASSIGNEES
// =============================
router.get('/my-assignees', verifyToken, checkEvaluator, async (req, res) => {
    try {
        const evaluator_id = req.user.user_id;
        const sqlAssnees = 'SELECT a.assignment_id, a.evaluatee_id, ' +
                           'u.fullname, ' +
                           'u.username, ' +
                           'p.period_name, ' +
                           'p.period_id,' +
                           'a.role ' +
                           'FROM assignment a ' +
                           'JOIN users u ON a.evaluatee_id = u.user_id ' +
                           'JOIN evaluation_period p ON a.period_id = p.period_id ' +
                           "WHERE a.evaluator_id = ? AND p.status = 'active'"


        const [rows] = await pool.query(sqlAssnees, [ evaluator_id ]);

        // Send data response
        return res.status(200).json({
            status: 'assignees_success',
            message: 'Assignees fetched successfully!',
            data: rows
        });

    } catch(error) {
        console.error('❌ Error fetching assignees: ', error);

        return res.status(500).json({
            status: 'server_error',
            message: 'An unexpected server error.'
        });
    };
});

// ==================================================
// 2. GET EVALUATION FORM
// 🎯 Route: /form?assignment_id={ID}
// ==================================================
router.get('/form', verifyToken, checkEvaluator, async (req, res) => {
    try {
        const assignment_id = req.query.assignment_id; // ⬅️ เปลี่ยนจาก req.params เป็น req.query
        const evaluator_id = req.user.user_id;

        if (!assignment_id) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Assignment ID is required in the query parameter.' 
            });
        }

        const [assignCheck] = await pool.query(
            'SELECT * FROM assignment WHERE assignment_id = ? AND evaluator_id = ?',
            [assignment_id, evaluator_id]
        );

        if (assignCheck.length === 0) {
            return res.status(403).json({ status: 'error', message: 'Access Denied. You do not have permission for this assignment.' });
        }

        const assignment = assignCheck[0];

        const sql = `
            SELECT 
                i.indicator_id,
                i.indicator_name,
                i.description,
                i.weight,
                i.eval_type,
                i.period_id
            FROM indicator i
            WHERE i.period_id = ?
            ORDER BY i.indicator_id ASC
        `;

        const [rows] = await pool.query(sql, [assignment.period_id]); 

        res.json({ 
            status: 'success', 
            message: 'Evaluation form details fetched successfully.',
            data: {
                assignment_details: assignment,
                indicators: rows
            }
        });

    } catch (error) {
        console.error('❌ Error fetching simplified form:', error);
        res.status(500).json({ status: 'server_error', message: 'An unexpected server error occurred.' });
    }
});
// ==================================================
// 3. SUBMIT SCORE (บันทึกคะแนน + ความเห็น)
// ==================================================
router.post('/submit', verifyToken, checkEvaluator, async (req, res) => {
    
    const { assignment_id, scores, overall_comment } = req.body;
    
    // 1. Minimal Validation
    if (!assignment_id || !Array.isArray(scores)) {
        return res.status(400).json({ status: 'error', message: 'Invalid data.' });
    }

    const conn = await pool.getConnection(); // Use 'conn'
    try {
        await conn.beginTransaction(); // START TRANSACTION

        // 2. Authorization Check
        const eId = req.user.user_id; // Evaluator ID
        const [aC] = await conn.query(
            'SELECT * FROM assignment WHERE assignment_id = ? AND evaluator_id = ?',
            [assignment_id, eId]
        );

        if (aC.length === 0) {
            await conn.rollback(); 
            return res.status(403).json({ status: 'error', message: 'Access Denied.' });
        }

        // 3. Update Overall Comment
        if (overall_comment) {
            await conn.query(
                'UPDATE assignment SET overall_comment = ? WHERE assignment_id = ?',
                [overall_comment, assignment_id]
            );
        }

        // 4. Loop and Upsert Scores
        for (const item of scores) {
            if (!item.indicator_id || isNaN(item.score)) continue; // ข้ามถ้าค่าไม่ถูกต้อง

            // Check existing score
            const [ex] = await conn.query(
                'SELECT score_id FROM score WHERE assignment_id = ? AND indicator_id = ?',
                [assignment_id, item.indicator_id]
            );

            // Upsert Logic
            if (ex.length > 0) {
                await conn.query(
                    'UPDATE score SET score = ? WHERE score_id = ?',
                    [item.score, ex[0].score_id]
                );
            } else {
                await conn.query(
                    'INSERT INTO score (assignment_id, indicator_id, score) VALUES (?, ?, ?)',
                    [assignment_id, item.indicator_id, item.score]
                );
            }
        }

        await conn.commit(); // COMMIT TRANSACTION
        res.status(200).json({ status: 'success', message: 'Submit successful.' });

    } catch (error) {
        await conn.rollback(); // ROLLBACK ON FAILURE
        console.error('Submit ROLLED BACK:', error.message || error);
        res.status(500).json({ status: 'server_error', message: 'Submit failed.' });
        
    } finally {
        conn.release(); // RELEASE CONNECTION
    }
});

// =============================
// MODULE EXPORT
// =============================
module.exports = router;