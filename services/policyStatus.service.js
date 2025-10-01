const { json } = require("express");
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

            const [rows] = await pool2.query(`SELECT
            DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%b') AS month,
            YEAR(FROM_UNIXTIME(elgb_act_date)) as year,
            SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
            SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
            SUM(CASE WHEN elgb_act = 'tnp' THEN 1 ELSE 0 END) AS termed_policy,
            SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy
            FROM policy_updates
            WHERE DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%Y-%m') BETWEEN ? AND ?
            AND TIMESTAMPDIFF(MONTH, CONCAT(?, '-01'), LAST_DAY(CONCAT(?, '-01'))) < 12
            GROUP BY month, year`,
            [date, date2, date, date2])
            return rows
        }
        else if (data.body.data === 'WEEK'){
            const weekDate = data.body.weekDate || new Date().toISOString().split('T')[0];
            const [rows] = await pool2.query(`SELECT
                DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%a') AS day,        
                SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
                SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
                SUM(CASE WHEN elgb_act = 'tnp' THEN 1 ELSE 0 END) AS termed_policy,
                SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy           
                FROM policy_updates
                WHERE YEARWEEK(FROM_UNIXTIME(elgb_act_date, '%Y-%m-%d')) = YEARWEEK(?)
                GROUP BY day`, [weekDate])
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