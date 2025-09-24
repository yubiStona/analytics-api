const reinstatedPolicyService = require("../services/reinstatedPolicies.service")

const reinstatedPolicy = async(req, res)=>{
    try{
        const {data, length} = await reinstatedPolicyService();
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', totalIDs:length , data });
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Service Error"});
    }
}

module.exports = reinstatedPolicy;