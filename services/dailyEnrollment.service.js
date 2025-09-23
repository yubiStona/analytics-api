const { pool2 } = require("../config/db");

const dailyEnroll = async (date) => {
  try {
    let result = [];
    if (date) {
      const [rows] = await pool2.query(
        `SELECT
                    FROM_UNIXTIME(edate, '%H:%i:%s') AS time,
                    status,
                    COUNT(*) AS enrollment
                FROM policies
                WHERE FROM_UNIXTIME(edate, '%Y-%m-%d') = ?
                  AND status IN ('active', 'termed', 'withdrawn')
                GROUP BY FROM_UNIXTIME(edate, '%Y-%m-%d'), FROM_UNIXTIME(edate, '%H:%i:%s')
                ORDER BY time`,[date]
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
