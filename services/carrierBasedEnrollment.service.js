const {pool2} = require('../config/db')

const carrierBasedDailyEnrollmentService = async(date)=>{
    try{
        const [query] = await pool2.query(`SELECT 
                    p.carrier,
                    COUNT(pp.policy_num) AS enrollments,
                    GROUP_CONCAT(pp.policy_num) AS policy_nums,
                    GROUP_CONCAT(pol.status) as status,
                    GROUP_CONCAT(FROM_UNIXTIME(edate, '%H:%i:%s')) as time
                    FROM plans p
                    LEFT JOIN plan_tier pt ON pt.pid_tier = p.pid
                    LEFT JOIN plan_pricing pr ON pr.plan_id = pt.idplan_tier
                    LEFT JOIN plan_policies pp ON pp.plan_id = pr.plan_pricing_id
                    LEFT JOIN policies pol ON pol.policy_id = pp.policy_num
                    WHERE FROM_UNIXTIME(pp.date, '%Y-%m-%d') = ?
                    GROUP BY p.carrier`, [date]);
        return query;
    }catch(err){
        console.error(err);
        return err;
    }
}

const carrierBasedYearlyEnrollmentService = async()=>{
    try{
        const [rows] = await pool2.query(`SELECT    
                    YEAR(FROM_UNIXTIME(date)) AS year,
                    p.carrier as carrier,
                    COUNT(pp.policy_num) AS enrollments,
                    SUM(CASE WHEN pol.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
                    SUM(CASE WHEN pol.status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
                    SUM(CASE WHEN pol.status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
                    FROM plans p
                    LEFT JOIN plan_tier pt ON pt.pid_tier = p.pid
                    LEFT JOIN plan_pricing pr ON pr.plan_id = pt.idplan_tier
                    LEFT JOIN plan_policies pp ON pp.plan_id = pr.plan_pricing_id
                    LEFT JOIN policies pol ON pol.policy_id = pp.policy_num
                    WHERE YEAR(FROM_UNIXTIME(date)) >= YEAR(DATE_SUB(CURDATE(), INTERVAL 6 YEAR))
                    AND YEAR(FROM_UNIXTIME(date)) < YEAR(CURDATE())
                    AND pol.status IN ('active', 'termed', 'withdrawn')
                    GROUP BY year, carrier
                    ORDER BY year, carrier`)
            // Transform flat array into nested JSON by carrier -> year
        const nestedData = rows.reduce((acc, cur) => {
            const carrierKey = `carrier ${cur.carrier}`;
            if (!acc[carrierKey]) acc[carrierKey] = {};
            acc[carrierKey][cur.year] = {
                enrollments: parseInt(cur.enrollments),
                active_count: parseInt(cur.active_count),
                withdrawn_count: parseInt(cur.withdrawn_count),
                termed_count: parseInt(cur.termed_count)
            };
            return acc;
        }, {});
        const arrayData = Object.entries(nestedData).map(([carrierKey, year]) => ({
            carrier: carrierKey,
            year: year  // months is itself an object with month keys and data
        }));
        return  arrayData
    }catch(err){
        console.error(err);
        return err;
    }
}

const carrierBasedMonthlyEnrollmentService = async () => {
  try {
    const [rows] = await pool2.query(`
      SELECT
        DATE_FORMAT(FROM_UNIXTIME(date), '%b') AS month,   
        p.carrier as carrier,
        COUNT(pp.policy_num) AS enrollments,
        MONTH(FROM_UNIXTIME(date)) AS month_num,
        SUM(CASE WHEN pol.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN pol.status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
        SUM(CASE WHEN pol.status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
        FROM plans p
        LEFT JOIN plan_tier pt ON pt.pid_tier = p.pid
        LEFT JOIN plan_pricing pr ON pr.plan_id = pt.idplan_tier
        LEFT JOIN plan_policies pp ON pp.plan_id = pr.plan_pricing_id
        LEFT JOIN policies pol ON pol.policy_id = pp.policy_num
        WHERE DATE_FORMAT(FROM_UNIXTIME(date), '%Y-%m') >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m')
        AND DATE_FORMAT(FROM_UNIXTIME(date), '%Y-%m') < DATE_FORMAT(CURDATE(), '%Y-%m')
        AND pol.status IN ('active', 'termed', 'withdrawn')
        GROUP BY carrier, month_num
        ORDER BY carrier, month_num`);

    // Transform flat array into nested JSON by carrier -> month
    const nestedData = rows.reduce((acc, cur) => {
      const carrierKey = `carrier ${cur.carrier}`;
      if (!acc[carrierKey]) acc[carrierKey] = {};
      acc[carrierKey][cur.month] = {
        enrollments: parseInt(cur.enrollments),
        active_count: parseInt(cur.active_count),
        withdrawn_count: parseInt(cur.withdrawn_count),
        termed_count: parseInt(cur.termed_count)
      };
      return acc;
    }, {});
    const arrayData = Object.entries(nestedData).map(([carrierKey, months]) => ({
        carrier: carrierKey,
        months: months  // months is itself an object with month keys and data
    }));

    return arrayData
  } catch (err) {
    console.error(err);
    return err;
  }
}

const carrierBasedWeeklyEnrollmentService = async()=>{
    try{

        const [rows] = await pool2.query(` SELECT
            DATE_FORMAT(FROM_UNIXTIME(date), '%a') AS day,   
            p.carrier as carrier,
            COUNT(pp.policy_num) AS enrollments,
            SUM(CASE WHEN pol.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
            SUM(CASE WHEN pol.status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
            SUM(CASE WHEN pol.status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
            FROM plans p
            LEFT JOIN plan_tier pt ON pt.pid_tier = p.pid
            LEFT JOIN plan_pricing pr ON pr.plan_id = pt.idplan_tier
            LEFT JOIN plan_policies pp ON pp.plan_id = pr.plan_pricing_id
            LEFT JOIN policies pol ON pol.policy_id = pp.policy_num
            WHERE YEARWEEK(FROM_UNIXTIME(date, '%Y-%m-%d')) = YEARWEEK(NOW())
            GROUP BY carrier, day
            ORDER BY day, carrier`); 
        const nestedData = rows.reduce((acc, cur) => {
            const carrierKey = `carrier ${cur.carrier}`;
            if (!acc[carrierKey]) acc[carrierKey] = {};
            acc[carrierKey][cur.day] = {
                enrollments: parseInt(cur.enrollments),
                active_count: parseInt(cur.active_count),
                withdrawn_count: parseInt(cur.withdrawn_count),
                termed_count: parseInt(cur.termed_count)
            };
            return acc;
        }, {});
        const arrayData = Object.entries(nestedData).map(([carrierKey, day]) => ({
            carrier: carrierKey,
            days: day  // months is itself an object with month keys and data
        }));

        return arrayData
    }catch(err){
        console.error(err);
        return err;
    }
}
module.exports = {carrierBasedDailyEnrollmentService, carrierBasedYearlyEnrollmentService, carrierBasedMonthlyEnrollmentService, carrierBasedWeeklyEnrollmentService};