const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

router.get('/', discussionController.getDiscussions);
router.get('/:id', discussionController.getDiscussion);
router.post('/', auth, validation.createDiscussion, discussionController.createDiscussion);

module.exports = router;