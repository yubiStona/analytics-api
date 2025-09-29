const { pool2 } = require("../config/db")

const policyStatusService = async(data)=>{
    try{
        if(data.body.data === 'YEAR'){
            const [rows] = await pool2.query(`SELECT
                YEAR(FROM_UNIXTIME(elgb_act_date)) as year,         
                SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
                SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
                SUM(CASE WHEN elgb_act = 'tnp' THEN 1 ELSE 0 END) AS termed_policy,
                SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy           
                FROM policy_updates
                WHERE YEAR(FROM_UNIXTIME(elgb_act_date)) >= YEAR(DATE_SUB(CURDATE(), INTERVAL 6 YEAR))
                AND YEAR(FROM_UNIXTIME(elgb_act_date)) < YEAR(CURDATE())
                GROUP BY year
                ORDER BY year`)
            return rows
        }else if(data.body.data === 'MONTH'){
            const [rows] = await pool2.query(`SELECT
                DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%b') AS month,        
                SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
                SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
                SUM(CASE WHEN elgb_act = 'tnp' THEN 1 ELSE 0 END) AS termed_policy,
                SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy           
                FROM policy_updates
                WHERE DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%Y-%m') >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m')
                AND DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%Y-%m') < DATE_FORMAT(CURDATE(), '%Y-%m')
                GROUP BY month`)
            return rows
        }else if (data.body.data === 'WEEK'){
            const [rows] = await pool2.query(`SELECT
                DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%a') AS day,        
                SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
                SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
                SUM(CASE WHEN elgb_act = 'tnp' THEN 1 ELSE 0 END) AS termed_policy,
                SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy           
                FROM policy_updates
                WHERE YEARWEEK(FROM_UNIXTIME(elgb_act_date, '%Y-%m-%d')) = YEARWEEK(NOW())
                GROUP BY day`)
            return rows

        }else{
            const date = data.body.date || new Date().toISOString().split('T')[0];
            const [rows] = await pool2.query(`SELECT
                FROM_UNIXTIME(elgb_act_date, '%H') AS time,        
                SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
                SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
                SUM(CASE WHEN elgb_act in ('tnp', 'tcr') THEN 1 ELSE 0 END) AS termed_policy,
                SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy           
                FROM policy_updates
                WHERE FROM_UNIXTIME(elgb_act_date, '%Y-%m-%d') = ?
                GROUP BY time 
                ORDER BY time`,[date])
            return rows
        }
    }catch(err){
        console.error(err)
        return err;
    }
}

module.exports = policyStatusService;