const express = require("express");
const {carrierBasedDailyEnrollment, carrierBasedYearlyEnrollment, carrierBasedMonthlyEnrollment, carrierBasedWeeklyEnrollment} = require("../controllers/carrierBasedEnrollment.controller");
const authenticateUser = require("../middleware/authentication");
const router = express.Router();

router.get('/daily/:id',authenticateUser, carrierBasedDailyEnrollment);
router.get('/yearly',authenticateUser, carrierBasedYearlyEnrollment);
router.get('/monthly',authenticateUser, carrierBasedMonthlyEnrollment);
router.get('/weekly',authenticateUser, carrierBasedWeeklyEnrollment);

module.exports =router