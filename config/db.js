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
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000
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
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000
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

async function tryGetConnection(pool,name, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log(`${name} successfully connected`);
      return true;
    } catch (err) {
      console.error(`DB connection attempt ${i + 1} failed: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
 
module.exports = { pool, pool2, db, db2, tryGetConnection };
 