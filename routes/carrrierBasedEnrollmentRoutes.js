const express = require("express");
const {carrierBasedDailyEnrollment, carrierBasedYearlyEnrollment, carrierBasedMonthlyEnrollment, carrierBasedWeeklyEnrollment} = require("../controllers/carrierBasedEnrollment.controller");
const router = express.Router();

router.get('/daily/:id', carrierBasedDailyEnrollment);
router.get('/yearly', carrierBasedYearlyEnrollment);
router.get('/monthly', carrierBasedMonthlyEnrollment);
router.get('/weekly', carrierBasedWeeklyEnrollment);

module.exports =router