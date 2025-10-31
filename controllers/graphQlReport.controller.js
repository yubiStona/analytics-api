const { pool2 } = require("../config/db");

            // a.agent_fname as First_Name,
            // a.agent_lname as Last_Name,
            // a.agent_email as Email,
            // a.agent_state as state,
            // a.agent_phone1 as Phone,
            // a.agent_level as Level

    // First_Name: String
    // Last_Name: String
    // Email: String
    // state: String
    // Phone: String
    // Level: String

    //     agent_id: Int
    // agent_fname: String
    // agent_lname: String
    // agent_email: String
    // agent_phone1: String
    // agent_level: String
    // agent_state: String
const typeDefs =`
  type AgentInfo {
    First_Name: String
    Last_Name: String
    Email: String
    State: String
    Phone: String
    Level: String
    active_count: Int
    withdrawn_count: Int
    termed_count: Int
  }

  type Query {
    directList(agent_ga: Int!): [AgentInfo]
  }
`;

const resolvers = {
  Query: {
    directList: async (parent, { agent_ga }) => {
      try {
        const [rows] = await pool2.query(
          `SELECT 
            a.agent_fname as First_Name,
            a.agent_lname as Last_Name,
            a.agent_email as Email,
            a.agent_state as State,
            a.agent_phone1 as Phone,
            a.agent_level as Level,
            SUM(CASE WHEN p.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
            SUM(CASE WHEN p.status = 'WITHDRAWN' THEN 1 ELSE 0 END) AS withdrawn_count,
            SUM(CASE WHEN p.status = 'TERMED' THEN 1 ELSE 0 END) AS termed_count
          FROM agent_info a
          LEFT JOIN policies p ON a.agent_id = p.p_agent_num
          WHERE a.agent_status = 'A' AND a.agent_ga = ?
          GROUP BY a.agent_id, a.agent_fname, a.agent_lname, a.agent_email, a.agent_state, a.agent_phone1, a.agent_level
          ORDER BY a.agent_id`,
          [agent_ga]
        );
        return rows;
      } catch (error) {
        console.error(error);
        return({message:'Failed to fetch direct list'});
      }
    },
  },
};

module.exports = {typeDefs, resolvers}
