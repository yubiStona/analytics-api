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
        // Extract days and counts from query rows
        const months = rows.map(row => row.month);
        const totalCounts = rows.map(row => row.enrollments);
        const activeCounts = rows.map(row => row.active_count);
        const withdrawnCounts = rows.map(row => row.withdrawn_count);
        const termedCounts = rows.map(row => row.termed_count);

        // Prepare arrays with zeros for all days
        const monthnames = ['Jan','Feb','Mar','Apr','Jun','July','Aug','Sep','Oct','Nov','Dec'];
        let activeEnrollments = [];
        let withdrawnEnrollments = [];
        let termedEnrollments = [];
        let totalEnrollments = [];

        let index = 0;
        monthnames.forEach(month => {
            if (months.includes(month)) {
                // Use the values from the database in order
                activeEnrollments.push(parseInt(activeCounts[index]));
                withdrawnEnrollments.push(parseInt(withdrawnCounts[index]));
                termedEnrollments.push(parseInt(termedCounts[index]));
                totalEnrollments.push(parseInt(totalCounts[index]));
                index++;
            } else {
                // No data for this day, push zero
                activeEnrollments.push(0);
                withdrawnEnrollments.push(0);
                termedEnrollments.push(0);
                totalEnrollments.push(0);
            }
        });

        // Structure response like Laravel function
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