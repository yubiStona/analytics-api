const {dailyEnroll} = require("../services/dailyEnrollment.service");

const getDailyEnroll = async (req, res) => {
    try {
        const date = req.params.id;
        if (!date) {
            return res.status(400).json({ status: 'error', message: 'Missing required query parameter: date' });
        }

        const data = await dailyEnroll(date);
        res.status(200).json({ status: 'success', message: 'Data fetched successfully', data });
    } catch (error) {
        console.error('Error fetching daily enroll data:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
}
module.exports = { getDailyEnroll };
