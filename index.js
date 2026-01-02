// =============================
// MODULE IMPORT
// =============================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db.js');


// =============================
// APPLICATION MIDDLEWARE
// =============================
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


// =============================
// ROUTES
// =============================
const authRoute = require('./routes/authRoute.js');
const userRoute = require('./routes/userRoute.js');
const adminRoute = require('./routes/adminRoute.js');
const evaluatorRoute = require('./routes/evaluatorRoute.js');

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/evaluator', evaluatorRoute);


// =============================
// START SERVER
// =============================
app.listen(port, () => {
    console.log('✅ Server is up and running on port: ' + port + '!');
});

