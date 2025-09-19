const {pool, pool2}= require("../config/db");

const monthlyEnrollmentService = async()=>{
    try{
        const [rows] = await pool2.query(`SELECT
            DATE_FORMAT(created_at, '%b') AS month,
            COUNT(*) AS enrollments,
            SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
            SUM(CASE WHEN status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
            SUM(CASE WHEN status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
            FROM policies
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            AND status IN ('active', 'termed', 'withdrawn')
            GROUP BY month
            ORDER BY month`);
        const monthnames = [];
        for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        // Get abbreviated month name in English locale
        monthnames.push(d.toLocaleString('en-US', { month: 'short' }));
        }

        const dataMap = new Map(rows.map(row => [row.month, row]));

        const activeEnrollments = [];
        const withdrawnEnrollments = [];
        const termedEnrollments = [];
        const totalEnrollments = [];

        monthnames.forEach((month) => {
        const row = dataMap.get(month);
        if (row) {
            activeEnrollments.push(parseInt(row.active_count));
            withdrawnEnrollments.push(parseInt(row.withdrawn_count));
            termedEnrollments.push(parseInt(row.termed_count));
            totalEnrollments.push(parseInt(row.enrollments));
        } else {
            activeEnrollments.push(0);
            withdrawnEnrollments.push(0);
            termedEnrollments.push(0);
            totalEnrollments.push(0);
        }
        });

        const response = {
        status: 'success',
        message: 'Data fetched successfully',
        data: [
            { name: 'Months', data: monthnames },
            { name: 'Total Enrollments', data: totalEnrollments },
            { name: 'Active', data: activeEnrollments },
            { name: 'Withdrawn', data: withdrawnEnrollments },
            { name: 'Termed', data: termedEnrollments }
        ]
        };

        return response;
    }catch(err){
        console.error(err);
        return err;
    }

}

module.exports = monthlyEnrollmentService;