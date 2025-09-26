const policyStatusService = require("../services/policyStatus.service")

const policyStatus = async(req, res)=>{
    try{
        const data = await policyStatusService(req);
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', data});
    }catch(err){
        console.error(err)
        res.status(500).json({message:"Internal Server Error"})
    }
}
module.exports = policyStatus;