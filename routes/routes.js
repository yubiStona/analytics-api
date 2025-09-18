const express = require("express");
const router = express.Router();
const getUnregisteredMembers = require("../controllers/unregisteredMembersController");
const nonLoggedinAgents = require("../controllers/nonLoggedinAgent.controller");

router.get("/members", getUnregisteredMembers);
router.get("/agents", nonLoggedinAgents);

module.exports = router;
