const express = require('express');
const router = express.Router();
const { getChatHistory, getUserChatSummary, deleteChatMessage, clearChatHistory } = require('../controllers/chat');
const { protect } = require('../middleware/authMiddleware');

// Get chat summary for all user's clubs (for navbar)
router.get('/user/summary', protect, getUserChatSummary);

// Delete a chat message
router.delete('/message/:id', protect, deleteChatMessage);

router.route('/:clubId/clear')
  .delete(protect, clearChatHistory);

router.route('/:clubId')
  .get(protect, getChatHistory);

module.exports = router;
