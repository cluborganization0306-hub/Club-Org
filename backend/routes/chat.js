const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chat');
const { protect } = require('../middleware/authMiddleware');

router.route('/:clubId')
  .get(protect, getChatHistory);

module.exports = router;
