const getNonLoggedInAgents = require("../services/getNonLoggedInAgents.service");

const nonLoggedinAgents = async (req, res) => {
  try {
    const { data, length } = await getNonLoggedInAgents();
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data,
      length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = nonLoggedinAgents;
