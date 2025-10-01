const { pool, pool2 } = require("../config/db");

const tierBasedEnrollmentservice = async(data)=>{
    try{
        if(data.body.data === 'MONTH'){
            const date = data.body.from;
            const date2 = data.body.to ;

            if (!date || !date2) {
            return { error: "Both dates must be present." };
            }

            function monthDiff(d1, d2) {
            const [y1, m1] = d1.split("-").map(Number);
            const [y2, m2] = d2.split("-").map(Number);
            return (y2 - y1) * 12 + (m2 - m1);
            }
            
            if (monthDiff(date, date2) >= 12) {
             return { error: "The difference between TO and FROM should not exceed 12 months." };
            }
            const[query] = await pool2.query(`SELECT
            YEAR(FROM_UNIXTIME(p.edate)) AS year,
            DATE_FORMAT(FROM_UNIXTIME(p.edate), '%b') AS month,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IO' THEN pp.policy_num END) AS IO_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IC' THEN pp.policy_num END) AS IC_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IS' THEN pp.policy_num END) AS IS_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IF' THEN pp.policy_num END) AS IF_tier
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND DATE_FORMAT(FROM_UNIXTIME(p.edate), '%Y-%m') BETWEEN ? AND ?
            AND TIMESTAMPDIFF(MONTH, CONCAT(?, '-01'), LAST_DAY(CONCAT(?, '-01'))) < 12 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE())) 
            GROUP BY year, month
            ORDER BY year ASC, MONTH(FROM_UNIXTIME(p.edate)) ASC`, [date, date2, date, date2]);
            return query;
        }else if(data.body.data === 'YEAR'){
            const[rows] = await pool2.query(`SELECT
            YEAR(FROM_UNIXTIME(p.edate)) as year, 
            COUNT(DISTINCT CASE WHEN pt.tier = 'IO' THEN pp.policy_num END) AS IO_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IC' THEN pp.policy_num END) AS IC_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IS' THEN pp.policy_num END) AS IS_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IF' THEN pp.policy_num END) AS IF_tier
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE()))
            AND YEAR(FROM_UNIXTIME(p.edate)) >= YEAR(DATE_SUB(CURDATE(), INTERVAL 6 YEAR))
            AND YEAR(FROM_UNIXTIME(p.edate)) < YEAR(CURDATE()) GROUP BY year;`)
            return rows;
        }else if(data.body.data === 'WEEK'){
            const weekDate = data.body.weekDate || new Date().toISOString().split('T')[0];
            const [rows] = await pool2.query (`SELECT
            DATE_FORMAT(FROM_UNIXTIME(p.edate), '%a') AS day,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IO' THEN pp.policy_num END) AS IO_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IC' THEN pp.policy_num END) AS IC_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IS' THEN pp.policy_num END) AS IS_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IF' THEN pp.policy_num END) AS IF_tier
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE()))
            AND YEARWEEK(FROM_UNIXTIME(p.edate, '%Y-%m-%d')) = YEARWEEK(?)
            GROUP BY day
            ORDER BY DATE(FROM_UNIXTIME(p.edate))`,[weekDate]);
            return rows;
        }else{
            const date = data.body.date || new Date().toISOString().split('T')[0];
            const [rows] = await pool2.query(`SELECT
            FROM_UNIXTIME((p.edate), '%H') AS time,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IO' THEN pp.policy_num END) AS IO_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IC' THEN pp.policy_num END) AS IC_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IS' THEN pp.policy_num END) AS IS_tier,
            COUNT(DISTINCT CASE WHEN pt.tier = 'IF' THEN pp.policy_num END) AS IF_tier
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE())) 
            AND FROM_UNIXTIME(p.edate, '%Y-%m-%d') = ?
            GROUP BY time`, [date]);
            return rows;
        }
    }catch(err){
        console.error(err);
        return err;
    }
}

module.exports = tierBasedEnrollmentservice;