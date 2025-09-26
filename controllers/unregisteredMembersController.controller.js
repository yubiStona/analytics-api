const getUnregisteredMembersService = require("../services/unregisteredMember.service");

const getUnregisteredMembers = async (req, res) => {
  try {
    const { unreg, reg, unreg_counts, reg_counts } = await getUnregisteredMembersService();
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      unreg_counts,
      reg_counts,
      unreg,
      reg
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = getUnregisteredMembers;
