const {carrierBasedDailyEnrollmentService, carrierBasedYearlyEnrollmentService, carrierBasedMonthlyEnrollmentService, carrierBasedWeeklyEnrollmentService} = require("../services/carrierBasedEnrollment.service");

const carrierBasedDailyEnrollment = async(req, res)=>{
    try{
        const date = req.params.id;
        if (!date) {
            return res.status(400).json({ status: 'error', message: 'Missing required query parameter: date' });
        }
        const enrolls = await carrierBasedDailyEnrollmentService(date);
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', enrolls })
    }catch(err){
        console.error(err);
        res.status(500).json({message:"Internal Server Error"})
    }
}

const carrierBasedYearlyEnrollment = async(req, res)=>{
    try{
        const enrolls = await carrierBasedYearlyEnrollmentService()
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', enrolls })

    }catch(err){
        console.error(err);
        res.status(500).json({message:'Internal Server Error'})
    }
}

const carrierBasedMonthlyEnrollment = async(req, res)=>{
    try{
        const enrolls = await carrierBasedMonthlyEnrollmentService();
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', enrolls })

    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'})
    }
}

const carrierBasedWeeklyEnrollment = async(req, res)=>{
    try{
        const enrolls = await carrierBasedWeeklyEnrollmentService();
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', enrolls })

    }catch(err){
        console.error(err)
        res.status(500).json({message:'Internal Server Error'})
    }
}
module.exports = {carrierBasedDailyEnrollment, carrierBasedYearlyEnrollment, carrierBasedMonthlyEnrollment, carrierBasedWeeklyEnrollment};