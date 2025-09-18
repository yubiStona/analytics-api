const {pool, pool2} = require("../config/db");

const policiesSoldByEachRepService = async()=>{
    const [query] = await pool2.query('select count(policy_id) as sold_policies, p_agent_num as agent_id from health_company1.policies GROUP BY  p_agent_num');
    return query;
}
module.exports = policiesSoldByEachRepService;