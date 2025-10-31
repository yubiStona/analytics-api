const express = require("express");
const weeklyEnrollment = require("../controllers/weeklyEnrollment.controller");
const { getDailyEnroll } = require("../controllers/dailyEnrollment.controller");
const monthlyEnrollment = require("../controllers/monthlyEnrollment.controller");
const {yearlyEnrollmentController}= require("../controllers/yearlyEnrollment.controller");
const tierBasedEnrollment = require("../controllers/tierBasedEnrollment.controller");
const pltypeBasedEnrollment = require("../controllers/pltypeBasedEnrollment.controller");
const authenticateUser = require("../middleware/authentication");
const router = express.Router();

router.get("/weekly",authenticateUser, weeklyEnrollment);
router.get("/daily/:id",authenticateUser, getDailyEnroll);
router.get("/monthly",authenticateUser, monthlyEnrollment);
router.get("/yearly",authenticateUser, yearlyEnrollmentController);
router.post("/tier",authenticateUser, tierBasedEnrollment)
router.post("/pltype",authenticateUser,pltypeBasedEnrollment)

module.exports = router;
