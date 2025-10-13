const express = require("express");
const weeklyEnrollment = require("../controllers/weeklyEnrollment.controller");
const { getDailyEnroll } = require("../controllers/dailyEnrollment.controller");
const monthlyEnrollment = require("../controllers/monthlyEnrollment.controller");
const {yearlyEnrollmentController}= require("../controllers/yearlyEnrollment.controller");
const tierBasedEnrollment = require("../controllers/tierBasedEnrollment.controller");
const pltypeBasedEnrollment = require("../controllers/pltypeBasedEnrollment.controller");
const router = express.Router();

router.get("/weekly", weeklyEnrollment);
router.get("/daily/:id", getDailyEnroll);
router.get("/monthly", monthlyEnrollment);
router.get("/yearly", yearlyEnrollmentController);
router.post("/tier", tierBasedEnrollment)
router.post("/pltype", pltypeBasedEnrollment)

module.exports = router;
