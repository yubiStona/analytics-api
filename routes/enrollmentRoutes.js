const express = require("express");
const weeklyEnrollment = require("../controllers/weeklyEnrollment");
const router = express.Router();

router.get('/weekly', weeklyEnrollment);

module.exports = router;