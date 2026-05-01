const Announcement = require('../models/Announcement');
const Club = require('../models/Club');

// Create an announcement
const createAnnouncement = async (req, res) => {
  const { clubId, content } = req.body;
  try {
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    if (req.user.role !== 'admin' && (!club.clubHeadId || !club.clubHeadId.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newAnnouncement = await Announcement.create({
      clubId,
      content,
      createdBy: req.user._id
    });
    
    await newAnnouncement.populate('createdBy', 'name');
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcements for a club
const getAnnouncements = async (req, res) => {
  const { clubId } = req.params;
  try {
    const announcements = await Announcement.find({ clubId }).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements };
