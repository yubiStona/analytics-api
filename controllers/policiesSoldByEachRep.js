const policiesSoldByEachRepService = require("../services/policiesSoldByEachRep.service");

const policiesSoldByEachRep = async(req,res)=>{
    const policiesWithRep = await policiesSoldByEachRepService();
    res.status(200).json({policiesWithRep});
}
module.exports = policiesSoldByEachRep;