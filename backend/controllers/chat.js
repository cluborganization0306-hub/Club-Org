const ChatMessage = require('../models/ChatMessage');
const Member = require('../models/Member');
const Club = require('../models/Club');

// Get chat history for a club
const getChatHistory = async (req, res) => {
  const { clubId } = req.params;
  try {
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

// Get chat summary for all user's clubs (for navbar dropdown)
const getUserChatSummary = async (req, res) => {
  try {
    const headClubs = await Club.find({ clubHeadId: req.user._id }).select('_id clubName');
    const memberships = await Member.find({ userId: req.user._id, status: 'approved' }).populate('clubId', 'clubName');
    
    const clubMap = new Map();
    
    headClubs.forEach(club => {
      clubMap.set(club._id.toString(), { clubId: club._id, clubName: club.clubName, role: 'Club Head' });
    });
    
    memberships.forEach(m => {
      if (m.clubId) {
        const key = m.clubId._id.toString();
        if (!clubMap.has(key)) {
          clubMap.set(key, { clubId: m.clubId._id, clubName: m.clubId.clubName, role: m.position || 'Member' });
        }
      }
    });

    if (req.user.role === 'admin') {
      const allClubs = await Club.find().select('_id clubName');
      allClubs.forEach(club => {
        const key = club._id.toString();
        if (!clubMap.has(key)) {
          clubMap.set(key, { clubId: club._id, clubName: club.clubName, role: 'Admin' });
        }
      });
    }

    const summary = [];
    for (const [, clubInfo] of clubMap) {
      const latestMessage = await ChatMessage.findOne({ clubId: clubInfo.clubId })
        .populate('senderId', 'name')
        .sort({ createdAt: -1 });
      
      const totalMessages = await ChatMessage.countDocuments({ clubId: clubInfo.clubId });

      summary.push({
        clubId: clubInfo.clubId,
        clubName: clubInfo.clubName,
        userRole: clubInfo.role,
        totalMessages,
        latestMessage: latestMessage ? {
          content: latestMessage.content,
          sender: latestMessage.senderId?.name || 'Unknown',
          time: latestMessage.createdAt
        } : null
      });
    }

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a chat message (club head, admin, or sender with position)
const deleteChatMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Admin can delete any message
    if (req.user.role === 'admin') {
      await ChatMessage.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Message deleted' });
    }

    // Club head of that club can delete any message
    const club = await Club.findById(message.clubId);
    if (club && club.clubHeadId && club.clubHeadId.equals(req.user._id)) {
      await ChatMessage.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Message deleted' });
    }

    // Sender can delete their own message
    if (message.senderId.equals(req.user._id)) {
      await ChatMessage.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Message deleted' });
    }

    // Members with a position (not just 'Member') can delete messages
    const membership = await Member.findOne({ clubId: message.clubId, userId: req.user._id, status: 'approved' });
    if (membership && membership.position && membership.position !== 'Member') {
      await ChatMessage.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Message deleted' });
    }

    return res.status(403).json({ message: 'Not authorized to delete this message' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatHistory, getUserChatSummary, deleteChatMessage };
