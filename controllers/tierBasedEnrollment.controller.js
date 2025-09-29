const tierBasedEnrollmentservice = require("../services/tierBasedEnrollments.service")

const tierBasedEnrollment = async (req, res) => {
    try{
        const data = await tierBasedEnrollmentservice(req);
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', data});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Service Error"});
    }
}
module.exports = tierBasedEnrollment;