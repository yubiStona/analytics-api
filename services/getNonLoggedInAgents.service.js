const { pool, pool2 } = require("../config/db");
const RedisClient = require("../utils/redisClient");

const getNonLoggedInAgents = async () => {
  try {
    const cachedData = await RedisClient.get("nonLoggedinAgentsCache");
    if (cachedData) {
      console.log("fetched nonLoggedinAgentsCache from redis")
      return JSON.parse(cachedData);
    }
    const [rows] = await pool2.query(
      "select distinct ai.agent_id from agent_info ai join agent_users au on ai.agent_id=au.agent_id where ai.agent_status = 'A' AND ai.agent_id not in ( select user_id from user_activity_details)"
    );
    const [rows2] = await pool2.query(`select distinct ai.agent_id from agent_info ai join agent_users au on ai.agent_id=au.agent_id where ai.agent_status = 'A' AND ai.agent_id  in ( select user_id from user_activity_details)`);
    const result = {nonLoggedin_agents:rows, loggedin_agents:rows2, nonLoggedin_counts:rows.length, loggedin_counts:rows2.length}
    if(result){
      await RedisClient.set("nonLoggedinAgentsCache", JSON.stringify(result), "EX", 1800)
    }
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};
module.exports = getNonLoggedInAgents;
