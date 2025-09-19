const express = require("express");
const weeklyEnrollment = require("../controllers/weeklyEnrollment.controller");
const { getDailyEnroll } = require("../controllers/dailyEnrollment.controller");
const monthlyEnrollment = require("../controllers/monthlyEnrollment.controller");
const router = express.Router();

router.get("/weekly", weeklyEnrollment);
router.get("/daily", getDailyEnroll);
router.get("/monthly", monthlyEnrollment);
module.exports = router;
