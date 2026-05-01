const ChatMessage = require('../models/ChatMessage');
const Member = require('../models/Member');

// Get chat history for a club
const getChatHistory = async (req, res) => {
  const { clubId } = req.params;
  try {
    // Ensure the user is a member of the club or admin
    const isMember = await Member.findOne({ clubId, userId: req.user._id, status: 'approved' });
    if (!isMember && req.user.role !== 'admin' && req.user.role !== 'club_head') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await ChatMessage.find({ clubId }).populate('senderId', 'name').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatHistory };
