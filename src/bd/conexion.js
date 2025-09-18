const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dbventasdemo'
});

// Exportar la conexión con promesas para trabajar con async/await
module.exports = pool.promise();