const express = require('express');
const router = express.Router();
const replyController = require('../controllers/replyController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

router.post('/:id/replies', auth, validation.createReply, replyController.createReply);
router.post('/:id/like', auth, replyController.likeReply);

module.exports = router;