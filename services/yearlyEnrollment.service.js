const { pool, pool2 } = require("../config/db");

const yearlyEnrollmentService = async () => {
  try {
    const [rows] = await pool2.query(`SELECT 
    YEAR(created_at) AS year,
    COUNT(*) AS enrollments,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
    SUM(CASE WHEN status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
    SUM(CASE WHEN status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
    FROM policies
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 YEAR)
    AND status IN ('active', 'termed', 'withdrawn')
    GROUP BY YEAR(created_at)
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
