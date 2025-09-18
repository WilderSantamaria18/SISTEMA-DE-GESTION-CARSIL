const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '123456',
    database: process.env.MYSQLDATABASE || 'dbventasdemo',
    port: process.env.MYSQLPORT || 3306
});

// Exportar la conexión con promesas para trabajar con async/await
module.exports = pool.promise();