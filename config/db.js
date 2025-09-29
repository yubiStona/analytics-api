const mysql = require('mysql2');
require('dotenv').config();
 
const db = mysql.createPool({
  host:process.env.HOST_NAME,
  user:process.env.USER_NAME,
  password:process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5, 
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

const db2 = mysql.createPool({
  host:process.env.HOST_NAME,
  user:process.env.USER_NAME,
  password:process.env.PASSWORD,
  database:process.env.DATABASE_NAME_TWO,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5, 
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});
const pool = db.promise();
const pool2 = db2.promise();
setInterval(() => {
  db.query('SELECT 1', (err) => {
    if (err) console.log('Primary DB: Health check detected dead connection - it will be replaced');
  });
  
  db2.query('SELECT 1', (err) => {
    if (err) console.log('Second DB: Health check detected dead connection - it will be replaced');
  });
}, 120000);

db.getConnection((err, connection) => {
  if (err) {
    console.error('Primary DB: Initial connection failed:', err.message);
    return;
  }
  console.log('Primary DB: Initial connection successful');
  connection.release();
});

db2.getConnection((err, connection) => {
  if (err) {
    console.error('Second DB: Initial connection failed:', err.message);
    return;
  }
  console.log('Second DB: Initial connection successful');
  connection.release();
});
 
module.exports = { pool, pool2, db, db2 };
 