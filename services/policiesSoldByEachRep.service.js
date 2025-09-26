const { pool, pool2 } = require("../config/db");

const policiesSoldByEachRepService = async () => {
  try {
    const [query] = await pool2.query(
      "select count(policy_id) as sold_policies, p_agent_num as agent_id from health_company1.policies GROUP BY  p_agent_num"
    );
    return query;
  } catch (err) {
    console.log(err);
  }
};

const policiesSoldByAgentId = async (id) => {
  try {
    console.log("rep_id:", id);
    const [result] = await pool2.query(
      `select count(policy_id) as sold_policies, p_agent_num as agent_id from policies where p_agent_num=? GROUP BY  p_agent_num`,[id]);
    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { policiesSoldByEachRepService, policiesSoldByAgentId };
