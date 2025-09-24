const { pool2 } = require("../config/db");

const reinstatedPolicyService = async()=>{
    try{
        const [rows] = await pool2.query(`SELECT p.policy_id AS Reinstated_Policy, count(p.policy_id) AS Count, GROUP_CONCAT(FROM_UNIXTIME(pu.elgb_act_date, '%Y-%m-%d')) as date
                FROM policies p
                JOIN policy_updates pu ON p.policy_id = pu.elgb_policyid
                WHERE pu.elgb_act = 'rpc'
                GROUP BY Reinstated_Policy`);
        return {data : rows, length : rows.length}

    }catch(err){
        console.error(err)
        return err;
    }

}

module.exports = reinstatedPolicyService;