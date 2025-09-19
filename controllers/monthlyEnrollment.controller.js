const monthlyEnrollmentService = require("../services/monthlyEnrollment.service")

const monthlyEnrollment = async(req, res)=>{
    try{
        const enrolls = await monthlyEnrollmentService();
        res.status(200).json({enrolls});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Server Error"})
    }

}
module.exports = monthlyEnrollment;