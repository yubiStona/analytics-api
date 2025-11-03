const { default: Redis } = require("ioredis");
const { pool2 } = require("../config/db");
const RedisClient = require("../utils/redisClient");

const policyStatusService = async(data)=>{
    try{
        if(data.body.data === 'YEAR'){
            const cachedData = await RedisClient.get("policyStatusCachedYearly")
            if(cachedData){
                console.log("fetched policyStatusCachedYearly from redis")
                return JSON.parse(cachedData)
            }
            const [rows] = await pool2.query(`SELECT
                YEAR(FROM_UNIXTIME(elgb_act_date)) as year,         
                SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
                SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
                SUM(CASE WHEN elgb_act in ('tnp', 'tcr') THEN 1 ELSE 0 END) AS termed_policy,
                SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy           
                FROM policy_updates
                WHERE YEAR(FROM_UNIXTIME(elgb_act_date)) >= YEAR(DATE_SUB(CURDATE(), INTERVAL 6 YEAR))
                AND YEAR(FROM_UNIXTIME(elgb_act_date)) < YEAR(CURDATE())
                GROUP BY year
                ORDER BY year`)
            if(rows.length>0){
                await RedisClient.set("policyStatusCachedYearly", JSON.stringify(rows), "EX", 1800)
            }
            return rows
        }else if(data.body.data === 'MONTH'){
            const date = data.body.from;
            const date2 = data.body.to ;

            if (!date || !date2) {
            return { error: "Both dates must be present." };
            }

            const cachedData = await RedisClient.get(`policyStatusCachedMonthly${date2}to${date}`)
            if(cachedData){
                console.log(`fetched policyStatusCachedMonthly${date2}to${date} from redis`)
                return JSON.parse(cachedData)
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
            SUM(CASE WHEN elgb_act in ('tnp', 'tcr') THEN 1 ELSE 0 END) AS termed_policy,
            SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy
            FROM policy_updates
            WHERE DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%Y-%m') BETWEEN ? AND ?
            AND TIMESTAMPDIFF(MONTH, CONCAT(?, '-01'), LAST_DAY(CONCAT(?, '-01'))) < 12
            GROUP BY month, year`,
            [date, date2, date, date2])
            if(rows.length>0){
                await RedisClient.set(`policyStatusCachedMonthly${date2}to${date}`, JSON.stringify(rows), "EX", 1800)
            }
            return rows
        }
        else if (data.body.data === 'WEEK'){
            const weekDate = data.body.weekDate || new Date().toISOString().split('T')[0];
            const cachedData = await RedisClient.get(`policyStatusCachedWeekly${weekDate}`)
            if(cachedData){
                console.log(`fetched policyStatusCachedWeekly${weekDate} from redis`)
                return JSON.parse(cachedData)
            }
            const [rows] = await pool2.query(`SELECT
                DATE_FORMAT(FROM_UNIXTIME(elgb_act_date), '%a') AS day,        
                SUM(CASE WHEN elgb_act = 'new' THEN 1 ELSE 0 END) AS new_policy,
                SUM(CASE WHEN elgb_act = 'wdr' THEN 1 ELSE 0 END) AS withdrawn_policy,
                SUM(CASE WHEN elgb_act in ('tnp', 'tcr') THEN 1 ELSE 0 END) AS termed_policy,
                SUM(CASE WHEN elgb_act = 'rpc' THEN 1 ELSE 0 END) AS reinstated_policy           
                FROM policy_updates
                WHERE YEARWEEK(FROM_UNIXTIME(elgb_act_date, '%Y-%m-%d')) = YEARWEEK(?)
                GROUP BY day`, [weekDate])
            if(rows.length>0){
                await RedisClient.set(`policyStatusCachedWeekly${weekDate}`, JSON.stringify(rows), "EX", 1800)
            }
            return rows

        }else{
            const date = data.body.date || new Date().toISOString().split('T')[0];
            const cachedData = await RedisClient.get(`policyStatusCachedDaily${date}`)
            if(cachedData){
                console.log(`fetched policyStatusCachedDaily${date} from redis`)
                return JSON.parse(cachedData)
            }
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
            if(rows.length>0){
                await RedisClient.set(`policyStatusCachedDaily${date}`, JSON.stringify(rows), "EX", 1800)
            }
            return rows
        }
    }catch(err){
        console.error(err)
        return err;
    }
}

module.exports = policyStatusService;