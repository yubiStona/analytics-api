const express = require("express");
const router = express.Router();
const getUnregisteredMembers = require("../controllers/unregisteredMembersController.controller");
const nonLoggedinAgents = require("../controllers/nonLoggedinAgent.controller");
const {policiesSoldByEachRep,getPoliciesSoldByAgentId} = require('../controllers/policiesSoldByEachRep.controller');
const dupUserDupPolicy = require("../controllers/dupUserDupPolicy.controller");
const reinstatedPolicy = require("../controllers/reinstatedPolicies.controller");

router.get('/un-reg/members', getUnregisteredMembers);
router.get('/un-log/agents', nonLoggedinAgents);
router.get('/sold/policies-rep', policiesSoldByEachRep);
router.get('/sold/policies-rep/:id',getPoliciesSoldByAgentId);
router.get('/dupUserDupPolicy',dupUserDupPolicy);
router.get("/reinstated", reinstatedPolicy);
module.exports = router;
