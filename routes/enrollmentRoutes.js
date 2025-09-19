const express = require("express");
const weeklyEnrollment = require("../controllers/weeklyEnrollment");
const { getDailyEnroll } = require("../controllers/dailyEnroll.controller");
const router = express.Router();

router.get("/weekly", weeklyEnrollment);
router.get("/daily", getDailyEnroll);
module.exports = router;
