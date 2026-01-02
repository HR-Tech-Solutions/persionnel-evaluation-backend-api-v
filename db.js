// =============================
// MODULE IMPORT
// =============================
const mysql = require('mysql2/promise');
require('dotenv').config();


// =============================
// VALIDATION & SHUDOWN LOGIC
// =============================
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;
const envVarsName = [ 'DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE' ];
const hasError = false;

for (const envVar of envVarsName) {
    if (!process.env[envVar]) {
        console.error('❌ CONFIG ERROR: *****' + envVar + '***** is missing in the .env file.');
        hasError = true;
    };
};

if (hasError) {
    console.error('🛑 Database Configuration Failed. Shutting down process.');
    process.exit(1);
};


// =============================
// CREATE POOL MIDDLEWARE
// =============================
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 13,
    queueLimit: 0
});


// =============================
// VALIDATION CONNECTION 
// =============================
pool.getConnection()
    .then(connection => {
        console.log('✅ Database Connection Successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed.');
        console.error('🛑 Shutting down process: ', err);
        process.exit(1);
    });


// =============================
// MODULE EXPORT
// =============================
module.exports = pool;