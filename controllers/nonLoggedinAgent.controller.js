const getNonLoggedInAgents = require("../services/getNonLoggedInAgents.service");

const nonLoggedinAgents = async (req, res) => {
  try {
    const {nonLoggedin_agents, loggedin_agents, nonLoggedin_counts, loggedin_counts}= await getNonLoggedInAgents();
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      loggedin_counts,
      nonLoggedin_counts,
      loggedin_agents,
      nonLoggedin_agents
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = nonLoggedinAgents;
