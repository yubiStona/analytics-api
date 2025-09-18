const express = require('express');
const router=express.Router();
const getUnregisteredMembers = require('../controllers/unregisteredMembersController');

router.get('/members', getUnregisteredMembers);

module.exports = router;