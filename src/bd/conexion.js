const mysql = require('mysql2');

console.log('DB Connection Config:');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '***' : 'NOT SET');
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
console.log('MYSQLPORT:', process.env.MYSQLPORT);

// Mostrar información de depuración
console.log('DB Connection Config:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'dbventasdemo',
    port: parseInt(process.env.DB_PORT) || 3306,
    // Agregar opciones adicionales para mejorar la estabilidad
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportar la conexión con promesas para trabajar con async/await
module.exports = pool.promise();