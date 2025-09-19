const getUnregisteredMembersService = require("../services/unregisteredMember.service");

const getUnregisteredMembers = async (req, res) => {
  try {
    const { data, length } = await getUnregisteredMembersService();
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      length,
      data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = getUnregisteredMembers;
