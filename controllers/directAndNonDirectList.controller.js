const { directListService, nonDirectListService } = require("../services/directAndNonDirectList.service")

const directList = async(req, res)=>{
    try{
        const data = await directListService(req)
        res.status(200).json({status: 'success', message: 'Data fetched successfully',count:data.length, data: data})
    }catch(err){
        console.error(err);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }   
}

const nonDirectList = async(req, res)=>{
    try{
        const agent_ga =req.body.agent_ga
        const data = await nonDirectListService(agent_ga)
        res.status(200).json({status: 'success', message: 'Data fetched successfully', count:data.length, data: data})
    }catch(err){
        console.error(err);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }   
}
module.exports = {directList, nonDirectList};