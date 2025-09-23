const { pool2 } = require("../config/db");

const dupUserDupPolicyService = async()=>{
    try{
        const [rows] = await pool2.query(`SELECT u.cemail,
                    GROUP_CONCAT(u.userid) AS DuplicateUSERIDs,
                    GROUP_CONCAT(CONCAT(p.policy_id, ':', p.status)) AS PolicyIDs
                    FROM userinfo u
                    JOIN policies p ON u.userid = p.policy_userid
                    GROUP BY u.cemail
                    HAVING COUNT(DISTINCT u.userid) > 1
                    AND COUNT(DISTINCT p.policy_id) > 1`);
        return rows;
    }catch(err){
        console.error(err);
        return err;
    }         
}
module.exports = dupUserDupPolicyService;