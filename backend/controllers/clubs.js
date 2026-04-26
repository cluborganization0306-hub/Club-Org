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
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    club.clubHeadId = clubHeadId;
    await club.save();
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request to lead a club
const requestHead = async (req, res) => {
  const { id } = req.params;
  try {
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    if (club.clubHeadId) return res.status(400).json({ message: 'Club already has a head' });
    if (club.pendingRequests.includes(req.user._id)) {
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
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    club.clubHeadId = userId;
    club.pendingRequests = []; // clear requests once approved
    await club.save();
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

module.exports = { getClubs, createClub, assignClubHead, requestHead, approveRequest, rejectRequest };
