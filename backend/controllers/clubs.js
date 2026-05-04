const Club = require('../models/Club');
const User = require('../models/User');

// Get all clubs
const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate('clubHeadId', 'name email')
      .populate('pendingRequests', 'name email');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new club (Admin)
const createClub = async (req, res) => {
  const { clubName, description, clubHeadId, logoUrl } = req.body;
  try {
    if (clubHeadId) {
      const existingClub = await Club.findOne({ clubHeadId });
      if (existingClub) {
        return res.status(400).json({ message: 'User is already head of another club' });
      }
    }
    const newClub = await Club.create({ clubName, description, clubHeadId, logoUrl });
    res.status(201).json(newClub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign club head
const assignClubHead = async (req, res) => {
  const { id } = req.params;
  const { clubHeadId } = req.body;
  
  try {
    if (clubHeadId) {
      const existingClub = await Club.findOne({ clubHeadId });
      if (existingClub && existingClub._id.toString() !== id) {
        return res.status(400).json({ message: 'User is already head of another club' });
      }
    }
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    club.clubHeadId = clubHeadId;
    await club.save();

    // Upgrade user role if they are a student
    if (clubHeadId) {
      const user = await User.findById(clubHeadId);
      if (user && user.role === 'student') {
        user.role = 'club_head';
        await user.save();
      }
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request to lead a club
const requestHead = async (req, res) => {
  const { id } = req.params;
  try {
    const existingClub = await Club.findOne({ clubHeadId: req.user._id });
    if (existingClub) {
      return res.status(400).json({ message: 'You are already head of another club' });
    }

    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    if (club.clubHeadId) return res.status(400).json({ message: 'Club already has a head' });
    if (club.pendingRequests.some(reqId => reqId.equals(req.user._id))) {
      return res.status(400).json({ message: 'Request already sent' });
    }
    
    club.pendingRequests.push(req.user._id);
    await club.save();
    res.json({ message: 'Request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a request
const approveRequest = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    if (userId) {
      const existingClub = await Club.findOne({ clubHeadId: userId });
      if (existingClub && existingClub._id.toString() !== id) {
        return res.status(400).json({ message: 'User is already head of another club' });
      }
    }

    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    club.clubHeadId = userId;
    club.pendingRequests = []; // clear requests once approved
    await club.save();

    // Upgrade user role if they are a student
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.role === 'student') {
        user.role = 'club_head';
        await user.save();
      }
    }

    res.json({ message: 'Club Head approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a request
const rejectRequest = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    club.pendingRequests = club.pendingRequests.filter(reqId => reqId.toString() !== userId);
    await club.save();
    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update club (Admin)
const updateClub = async (req, res) => {
  const { id } = req.params;
  const { clubName, description, clubHeadId, logoUrl } = req.body;
  try {
    if (clubHeadId) {
      const existingClub = await Club.findOne({ clubHeadId });
      if (existingClub && existingClub._id.toString() !== id) {
        return res.status(400).json({ message: 'User is already head of another club' });
      }
    }

    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    club.clubName = clubName || club.clubName;
    club.description = description || club.description;
    if (clubHeadId !== undefined) {
      club.clubHeadId = clubHeadId;
      // Upgrade user role if they are a student
      if (clubHeadId) {
        const user = await User.findById(clubHeadId);
        if (user && user.role === 'student') {
          user.role = 'club_head';
          await user.save();
        }
      }
    }
    if (logoUrl !== undefined) club.logoUrl = logoUrl;

    await club.save();
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete club (Admin)
const deleteClub = async (req, res) => {
  const { id } = req.params;
  try {
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    await Club.findByIdAndDelete(id);
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getClubs, createClub, assignClubHead, requestHead, approveRequest, rejectRequest, updateClub, deleteClub };
