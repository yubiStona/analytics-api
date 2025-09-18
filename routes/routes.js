const express = require("express");
const router = express.Router();
const getUnregisteredMembers = require("../controllers/unregisteredMembersController");
const nonLoggedinAgents = require("../controllers/nonLoggedinAgent.controller");
const policiesSoldByEachRep = require('../controllers/policiesSoldByEachRep');

router.get('/members', getUnregisteredMembers);
router.get('/agents', nonLoggedinAgents);
router.get('/policies-rep', policiesSoldByEachRep);

module.exports = router;
