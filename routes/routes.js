const express = require("express");
const router = express.Router();
const getUnregisteredMembers = require("../controllers/unregisteredMembersController.controller");
const nonLoggedinAgents = require("../controllers/nonLoggedinAgent.controller");
const {policiesSoldByEachRep,getPoliciesSoldByAgentId} = require('../controllers/policiesSoldByEachRep.controller');
const dupUserDupPolicy = require("../controllers/dupUserDupPolicy.controller");
const reinstatedPolicy = require("../controllers/reinstatedPolicies.controller");
const policyStatus = require("../controllers/policyStatusService.controller");
const { directList, nonDirectList } = require("../controllers/directAndNonDirectList.controller");
const {sendEmail, saveBase64Image} = require("../controllers/sendEmail.controller");
const { loginAdmin, verifyAdminOTP, logout, refreshAccessToken } = require("../controllers/adminLogin.controller");
const authenticateUser = require("../middleware/authentication");

router.get('/un-reg/members', authenticateUser, getUnregisteredMembers);
router.get('/un-log/agents', authenticateUser, nonLoggedinAgents);
router.get('/sold/policies-rep', authenticateUser, policiesSoldByEachRep);
router.get('/sold/policies-rep/:id',authenticateUser, getPoliciesSoldByAgentId);
router.get('/dupUserDupPolicy',authenticateUser, dupUserDupPolicy);
router.get("/reinstated", authenticateUser, reinstatedPolicy);
router.post("/policystatus", authenticateUser, policyStatus);
router.get('/directlist', authenticateUser, directList)
router.get('/nondirectlist',authenticateUser,nonDirectList)
router.post('/sendemail', authenticateUser,sendEmail);
router.post('/saveimg', authenticateUser,saveBase64Image)
router.post('/login', loginAdmin )
router.post('/logout',authenticateUser, logout)
router.post('/verifyotp', verifyAdminOTP)
router.get('/refresh', refreshAccessToken)
module.exports = router;
