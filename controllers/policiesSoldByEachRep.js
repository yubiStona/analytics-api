const policiesService = require("../services/policiesSoldByEachRep.service");

const policiesSoldByEachRep = async (req, res) => {
  try {
    const policiesWithRep = await policiesService.policiesSoldByEachRepService();
    res.status(200).json({ policiesWithRep });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPoliciesSoldByAgentId = async (req, res) => {
  try {
    const id = req.params.id;
    const policiesWithRep = await policiesService.policiesSoldByAgentId(id);
    res.status(200).json({ policiesWithRep });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { policiesSoldByEachRep, getPoliciesSoldByAgentId };
