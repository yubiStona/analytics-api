const { pool2 } = require("../config/db");
const RedisClient = require("../utils/redisClient");

const reinstatedPolicyService = async()=>{
    try{
        const cachedData = await RedisClient.get("reinstatedCachedData")
        if(cachedData){
            console.log("fetched reinstatedCachedData from redis")
            return JSON.parse(cachedData)
        }
        const [rows] = await pool2.query(`SELECT p.policy_id AS Reinstated_Policy, count(p.policy_id) AS Count, GROUP_CONCAT(FROM_UNIXTIME(pu.elgb_act_date, '%Y-%m-%d')) as date
                FROM policies p
                JOIN policy_updates pu ON p.policy_id = pu.elgb_policyid
                WHERE pu.elgb_act = 'rpc'
                GROUP BY Reinstated_Policy`);
        const [rows2]= await pool2.query(`SELECT count(policy_id) AS count from policies where policy_id not in
                (SELECT distinct p.policy_id AS Reinstated_Policy
                FROM policies p
                JOIN policy_updates pu ON p.policy_id = pu.elgb_policyid
                WHERE pu.elgb_act = 'rpc')`)
        const result = {reinstated : rows, total_reinstated : rows.length, others : rows2}
        if(result){
            await RedisClient.set("reinstatedCachedData", JSON.stringify(result), "EX", 1800)
        }
        return result

    }catch(err){
        console.error(err)
        return err;
    }

}

module.exports = reinstatedPolicyService;