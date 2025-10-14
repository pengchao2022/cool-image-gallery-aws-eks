const express = require('express');
const router = express.Router();
const discussionsRouter = require('./discussions');
const repliesRouter = require('./replies');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.use('/discussions', discussionsRouter);
router.use('/replies', repliesRouter);

router.get('/users/:userId/activity', auth, userController.getUserActivity);
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;