const { pool, pool2 } = require("../config/db");

const getNonLoggedInAgents = async () => {
  try {
    const [rows] = await pool2.query(
      "select ai.agent_id as agentId from agent_info ai join agent_users au on ai.agent_id=au.agent_id where ai.agent_id not in ( select user_id from user_activity_details)"
    );
    return { data: rows, length: rows.length };
  } catch (err) {
    console.error(err);
    return err;
  }
};
module.exports = getNonLoggedInAgents;
