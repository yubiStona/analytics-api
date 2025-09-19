const {yearlyEnrollmentService} = require("../services/yearlyEnrollment.service");

const yearlyEnrollmentController = async(req, res) => {
    try{
        const data = await yearlyEnrollmentService();
        res.status(200).json({
            status: 'success',
            message: 'Data fetched successfully',
            data
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

module.exports = {yearlyEnrollmentController};