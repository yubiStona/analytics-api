const dupUserDupPolicyService = require("../services/dupUserDupPolicy.service")

const dupUserDupPolicy = async(req,res)=>{
    try{
        const enrolls = await dupUserDupPolicyService();
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', enrolls });  
    }catch(err){
        console.error(err);
        res.status(500).json({message:'Internal Server Error'})
    }
}
module.exports = dupUserDupPolicy;