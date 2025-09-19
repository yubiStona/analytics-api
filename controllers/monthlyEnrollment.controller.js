const monthlyEnrollmentService = require("../services/monthlyEnrollment.service");

const monthlyEnrollment = async (req, res) => {
  try {
    const enrolls = await monthlyEnrollmentService();
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      enrolls,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = monthlyEnrollment;
