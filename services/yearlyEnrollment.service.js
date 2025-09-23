const { pool, pool2 } = require("../config/db");

const yearlyEnrollmentService = async () => {
  try {
    const [rows] = await pool2.query(`SELECT 
    YEAR(FROM_UNIXTIME(edate)) AS year,
    COUNT(*) AS enrollments,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
    SUM(CASE WHEN status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
    SUM(CASE WHEN status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
    FROM policies
    WHERE YEAR(FROM_UNIXTIME(edate)) >= YEAR(DATE_SUB(CURDATE(), INTERVAL 6 YEAR))
    AND YEAR(FROM_UNIXTIME(edate)) < YEAR(CURDATE())
    AND status IN ('active', 'termed', 'withdrawn')
    GROUP BY year
    ORDER BY year;
    `);
    return rows;
    // Extract days and counts from query rows
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {yearlyEnrollmentService};
