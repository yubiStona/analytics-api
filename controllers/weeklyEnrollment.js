const weeklyEnrollmentService = require("../services/weeklyEnrollment.service")

const weeklyEnrollment = async(req, res)=>{
    try{
        const enrolls = await weeklyEnrollmentService();
        res.status(200).json({enrolls});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Server Error"});
    }

}
module.exports = weeklyEnrollment;