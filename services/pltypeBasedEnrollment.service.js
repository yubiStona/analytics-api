const { pool, pool2 } = require("../config/db");

const pltypeBasedEnrollmentservice = async(data)=>{
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
            COUNT( CASE WHEN pl.pl_type = 'LM' THEN pp.policy_num END) AS limitedmed,
            COUNT( CASE WHEN pl.pl_type in ('DENT', 'THEFT_DENT') THEN pp.policy_num END) AS dental,
            COUNT( CASE WHEN pl.pl_type = 'MM' THEN pp.policy_num END) AS medical,
            COUNT( CASE WHEN pl.pl_type = 'ACCIDENT' THEN pp.policy_num END) AS accident,
            COUNT( CASE WHEN pl.pl_type in ('CRITICAL', 'CI') THEN pp.policy_num END) AS critical,
            COUNT( CASE WHEN pl.pl_type = 'HOSPITAL' THEN pp.policy_num END) AS hospital,
            COUNT( CASE WHEN pl.pl_type = 'VISION' THEN pp.policy_num END) AS vision,
            COUNT( CASE WHEN pl.pl_type in ('DC','DISCOUNT','TELEMEDICINE','THEFT') THEN pp.policy_num END) AS lifestyle,
            COUNT( CASE WHEN pl.pl_type in ('ADI','CIADD','AME','LTD','GAP','AD','ASHIP', 'STDCANCER') THEN pp.policy_num END) AS supplemental,
            COUNT( CASE WHEN pl.pl_type in ('LIFE','TL') THEN pp.policy_num END) AS term_life,
            COUNT( CASE WHEN pl.pl_type in ('RX','DI', 'PET') THEN pp.policy_num END) AS others
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND DATE_FORMAT(FROM_UNIXTIME(p.edate), '%Y-%m') BETWEEN ? AND ?
            AND TIMESTAMPDIFF(MONTH, CONCAT(?, '-01'), LAST_DAY(CONCAT(?, '-01'))) < 12 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE())) 
            AND pl.pl_type != ""
            GROUP BY year, month
            ORDER BY year ASC, MONTH(FROM_UNIXTIME(p.edate)) ASC`, [date, date2, date, date2]);
            return query;
        }else if(data.body.data === 'YEAR'){
            const[rows] = await pool2.query(`SELECT
            YEAR(FROM_UNIXTIME(p.edate)) as year, 
            COUNT( CASE WHEN pl.pl_type = 'LM' THEN pp.policy_num END) AS limitedmed,
            COUNT( CASE WHEN pl.pl_type in ('DENT', 'THEFT_DENT') THEN pp.policy_num END) AS dental,
            COUNT( CASE WHEN pl.pl_type = 'MM' THEN pp.policy_num END) AS medical,
            COUNT( CASE WHEN pl.pl_type = 'ACCIDENT' THEN pp.policy_num END) AS accident,
            COUNT( CASE WHEN pl.pl_type in ('CRITICAL', 'CI') THEN pp.policy_num END) AS critical,
            COUNT( CASE WHEN pl.pl_type = 'HOSPITAL' THEN pp.policy_num END) AS hospital,
            COUNT( CASE WHEN pl.pl_type = 'VISION' THEN pp.policy_num END) AS vision,
            COUNT( CASE WHEN pl.pl_type in ('DC','DISCOUNT','TELEMEDICINE','THEFT') THEN pp.policy_num END) AS lifestyle,
            COUNT( CASE WHEN pl.pl_type in ('ADI','CIADD','AME','LTD','GAP','AD','ASHIP', 'STDCANCER') THEN pp.policy_num END) AS supplemental,
            COUNT( CASE WHEN pl.pl_type in ('LIFE','TL') THEN pp.policy_num END) AS term_life,
            COUNT( CASE WHEN pl.pl_type in ('RX','DI', 'PET') THEN pp.policy_num END) AS others
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE()))
            AND pl.pl_type != ""
            AND YEAR(FROM_UNIXTIME(p.edate)) >= YEAR(DATE_SUB(CURDATE(), INTERVAL 6 YEAR))
            AND YEAR(FROM_UNIXTIME(p.edate)) < YEAR(CURDATE()) GROUP BY year ORDER BY year;`)
            return rows;
        }else if(data.body.data === 'WEEK'){
            const weekDate = data.body.weekDate || new Date().toISOString().split('T')[0];
            const [rows] = await pool2.query (`SELECT
            DATE_FORMAT(FROM_UNIXTIME(p.edate), '%a') AS day,
            COUNT( CASE WHEN pl.pl_type = 'LM' THEN pp.policy_num END) AS limitedmed,
            COUNT( CASE WHEN pl.pl_type in ('DENT', 'THEFT_DENT') THEN pp.policy_num END) AS dental,
            COUNT( CASE WHEN pl.pl_type = 'MM' THEN pp.policy_num END) AS medical,
            COUNT( CASE WHEN pl.pl_type = 'ACCIDENT' THEN pp.policy_num END) AS accident,
            COUNT( CASE WHEN pl.pl_type in ('CRITICAL', 'CI') THEN pp.policy_num END) AS critical,
            COUNT( CASE WHEN pl.pl_type = 'HOSPITAL' THEN pp.policy_num END) AS hospital,
            COUNT( CASE WHEN pl.pl_type = 'VISION' THEN pp.policy_num END) AS vision,
            COUNT( CASE WHEN pl.pl_type in ('DC','DISCOUNT','TELEMEDICINE','THEFT') THEN pp.policy_num END) AS lifestyle,
            COUNT( CASE WHEN pl.pl_type in ('ADI','CIADD','AME','LTD','GAP','AD','ASHIP', 'STDCANCER') THEN pp.policy_num END) AS supplemental,
            COUNT( CASE WHEN pl.pl_type in ('LIFE','TL') THEN pp.policy_num END) AS term_life,
            COUNT( CASE WHEN pl.pl_type in ('RX','DI', 'PET') THEN pp.policy_num END) AS others
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE()))
            AND pl.pl_type != ""
            AND YEARWEEK(FROM_UNIXTIME(p.edate, '%Y-%m-%d')) = YEARWEEK(?)
            GROUP BY day
            ORDER BY DATE(FROM_UNIXTIME(p.edate))`,[weekDate]);
            return rows;
        }else{
            const date = data.body.date || new Date().toISOString().split('T')[0];
            const [rows] = await pool2.query(`SELECT
            FROM_UNIXTIME((p.edate), '%H') AS time,
            COUNT( CASE WHEN pl.pl_type = 'LM' THEN pp.policy_num END) AS limitedmed,
            COUNT( CASE WHEN pl.pl_type in ('DENT', 'THEFT_DENT') THEN pp.policy_num END) AS dental,
            COUNT( CASE WHEN pl.pl_type = 'MM' THEN pp.policy_num END) AS medical,
            COUNT( CASE WHEN pl.pl_type = 'ACCIDENT' THEN pp.policy_num END) AS accident,
            COUNT( CASE WHEN pl.pl_type in ('CRITICAL', 'CI') THEN pp.policy_num END) AS critical,
            COUNT( CASE WHEN pl.pl_type = 'HOSPITAL' THEN pp.policy_num END) AS hospital,
            COUNT( CASE WHEN pl.pl_type = 'VISION' THEN pp.policy_num END) AS vision,
            COUNT( CASE WHEN pl.pl_type in ('DC','DISCOUNT','TELEMEDICINE','THEFT') THEN pp.policy_num END) AS lifestyle,
            COUNT( CASE WHEN pl.pl_type in ('ADI','CIADD','AME','LTD','GAP','AD','ASHIP', 'STDCANCER') THEN pp.policy_num END) AS supplemental,
            COUNT( CASE WHEN pl.pl_type in ('LIFE','TL') THEN pp.policy_num END) AS term_life,
            COUNT( CASE WHEN pl.pl_type in ('RX','DI', 'PET') THEN pp.policy_num END) AS others
            FROM plan_policies pp
            JOIN policies p ON p.policy_id = pp.policy_num
            JOIN plan_pricing ppri ON ppri.plan_pricing_id = pp.plan_id
            JOIN plan_tier pt ON pt.idplan_tier = ppri.plan_id
            JOIN plans pl ON pl.pid = pt.pid_tier
            WHERE pl.is_assoc = 0 AND 
            (pp.pstatus = 1 OR 
            (pp.pstatus = 3 AND pp.pterm_date > CURDATE())) 
            AND pl.pl_type != ""
            AND FROM_UNIXTIME(p.edate, '%Y-%m-%d') = ?
            GROUP BY time`, [date]);
            return rows;
        }
    }catch(err){
        console.error(err);
        return err;
    }
}

module.exports = pltypeBasedEnrollmentservice;