const { pool } = require("../config/db");

const tierBasedEnrollmentservice = async(data)=>{
    try{
        if(data.body.data === 'MONTH'){
            const[query] = await pool.query(`SELECT
            DATE_FORMAT(FROM_UNIXTIME(p.edate), '%b') as month, SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IO' THEN 1 ELSE 0 END) as IO_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IC' THEN 1 ELSE 0 END) as IC_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IF' THEN 1 ELSE 0 END) as IF_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IS' THEN 1 ELSE 0 END) as IS_tier
            FROM cor_api.temp_storage ts JOIN health_company1.policies p ON ts.policy_id = p.policy_id
            WHERE ts.is_completed = 1
            AND ts.status = 'complete' AND DATE_FORMAT(FROM_UNIXTIME(p.edate), '%Y-%m') >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m')
            AND DATE_FORMAT(FROM_UNIXTIME(p.edate), '%Y-%m') < DATE_FORMAT(CURDATE(), '%Y-%m') GROUP BY month;`)
            return query
        }else if(data.body.data === 'YEAR'){
            const[rows] = await pool.query(`SELECT
            YEAR(FROM_UNIXTIME(p.edate)) as year, 
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IO' THEN 1 ELSE 0 END) as IO_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IC' THEN 1 ELSE 0 END) as IC_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IF' THEN 1 ELSE 0 END) as IF_tier,           
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IS' THEN 1 ELSE 0 END) as IS_tier
            FROM cor_api.temp_storage ts JOIN health_company1.policies p ON ts.policy_id = p.policy_id
            WHERE ts.is_completed = 1 
            AND ts.status = 'complete' AND YEAR(FROM_UNIXTIME(p.edate)) >= YEAR(DATE_SUB(CURDATE(), INTERVAL 6 YEAR))
            AND YEAR(FROM_UNIXTIME(p.edate)) < YEAR(CURDATE()) GROUP BY year;`)
            return rows;
        }else if(data.body.data === 'WEEK'){
            const [rows] = await pool.query (`SELECT
            DATE_FORMAT(FROM_UNIXTIME(p.edate), '%a') AS day,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IO' THEN 1 ELSE 0 END) as IO_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IC' THEN 1 ELSE 0 END) as IC_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IF' THEN 1 ELSE 0 END) as IF_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IS' THEN 1 ELSE 0 END) as IS_tier
            FROM cor_api.temp_storage ts JOIN health_company1.policies p ON ts.policy_id = p.policy_id
            WHERE ts.is_completed = 1 
            AND ts.status = 'complete' AND YEARWEEK(FROM_UNIXTIME(p.edate, '%Y-%m-%d')) = YEARWEEK(NOW())
            GROUP BY day`);
            return rows;
        }else{
            const date = data.body.date || new Date().toISOString().split('T')[0];
            const [rows] = await pool.query(`SELECT
            FROM_UNIXTIME((p.edate), '%H') AS time,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IO' THEN 1 ELSE 0 END) as IO_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IC' THEN 1 ELSE 0 END) as IC_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IF' THEN 1 ELSE 0 END) as IF_tier,
            SUM(CASE when JSON_UNQUOTE(JSON_EXTRACT(filter_info, '$.tier')) = 'IS' THEN 1 ELSE 0 END) as IS_tier
            FROM cor_api.temp_storage ts JOIN health_company1.policies p ON ts.policy_id = p.policy_id
            WHERE ts.is_completed = 1 
            AND ts.status = 'complete' 
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