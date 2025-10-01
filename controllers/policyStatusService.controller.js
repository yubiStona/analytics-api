const policyStatusService = require("../services/policyStatus.service")

const policyStatus = async(req, res)=>{
    try{
        const data = await policyStatusService(req);
        if (data.error) {
            return res.status(400).json({ status: 'error', message: data.error });
        }
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', data});
    }catch(err){
        console.error(err)
        res.status(500).json({message:"Internal Server Error"})
    }
}
module.exports = policyStatus;