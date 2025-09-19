const { pool2 } = require("../config/db");

const dailyEnroll = async (date) => {
  try {
    let result = [];
    if (date) {
      const [rows] = await pool2.query(
        `SELECT
                    TIME(created_at) AS time,
                    status,
                    COUNT(*) AS enrollments
                FROM policies
                WHERE DATE(created_at) = ?
                  AND status IN ('active', 'termed', 'withdrawn')
                GROUP BY DATE(created_at), TIME(created_at)
                ORDER BY time;`,[date]
      );
      result = rows;
    }
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = { dailyEnroll };
