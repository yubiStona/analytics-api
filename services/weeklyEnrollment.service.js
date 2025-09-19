const {pool,pool2}=require('../config/db');

const weeklyEnrollmentService = async () => {
    try {
        const [rows] = await pool2.query(`
            SELECT 
                DAYNAME(FROM_UNIXTIME(edate)) AS day,
                COUNT(userid) AS total_count,
                SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
                SUM(CASE WHEN status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
                SUM(CASE WHEN status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
            FROM userinfo_policy_address
            WHERE YEARWEEK(FROM_UNIXTIME(edate, '%Y-%m-%d')) = YEARWEEK(NOW())
            GROUP BY day
        `);

        // Extract days and counts from query rows
        const days = rows.map(row => row.day);
        const totalCounts = rows.map(row => row.total_count);
        const activeCounts = rows.map(row => row.active_count);
        const withdrawnCounts = rows.map(row => row.withdrawn_count);
        const termedCounts = rows.map(row => row.termed_count);

        // Prepare arrays with zeros for all days
        const daynames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        let activeMembers = [];
        let withdrawnMembers = [];
        let termedMembers = [];
        let totalMembers = [];

        let index = 0;
        daynames.forEach(day => {
            if (days.includes(day)) {
                // Use the values from the database in order
                activeMembers.push(parseInt(activeCounts[index]));
                withdrawnMembers.push(parseInt(withdrawnCounts[index]));
                termedMembers.push(parseInt(termedCounts[index]));
                totalMembers.push(parseInt(totalCounts[index]));
                index++;
            } else {
                // No data for this day, push zero
                activeMembers.push(0);
                withdrawnMembers.push(0);
                termedMembers.push(0);
                totalMembers.push(0);
            }
        });

        // Structure response like Laravel function
        const response = {
            status: 'success',
            message: 'Data fetched successfully',
            data: [
                { name: 'Days', data: daynames },
                { name: 'Total Counts', data: totalMembers },
                { name: 'Active', data: activeMembers },
                { name: 'Withdrawn', data: withdrawnMembers },
                { name: 'Termed', data: termedMembers }
            ]
        };

        return response;

    } catch (err) {
        console.error(err);
        return err;
    }
}


module.exports = weeklyEnrollmentService;