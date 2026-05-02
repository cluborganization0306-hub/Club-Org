const Announcement = require('../models/Announcement');
const Club = require('../models/Club');
const Member = require('../models/Member');

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

// Get all announcements for the logged-in user's clubs
const getUserAnnouncements = async (req, res) => {
  try {
    const headClubs = await Club.find({ clubHeadId: req.user._id }).select('_id clubName');
    const memberships = await Member.find({ userId: req.user._id, status: 'approved' }).select('clubId');
    const memberClubIds = memberships.map(m => m.clubId);
    
    const allClubIds = [...new Set([
      ...headClubs.map(c => c._id.toString()),
      ...memberClubIds.map(id => id.toString())
    ])];

    let announcements;
    if (req.user.role === 'admin') {
      announcements = await Announcement.find()
        .populate('createdBy', 'name')
        .populate('clubId', 'clubName')
        .sort({ createdAt: -1 })
        .limit(20);
    } else {
      announcements = await Announcement.find({ clubId: { $in: allClubIds } })
        .populate('createdBy', 'name')
        .populate('clubId', 'clubName')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an announcement (club head of that club or admin)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    // Admin can delete any
    if (req.user.role === 'admin') {
      await Announcement.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Announcement deleted' });
    }

    // Club head can delete announcements of their club
    const club = await Club.findById(announcement.clubId);
    if (club && club.clubHeadId && club.clubHeadId.equals(req.user._id)) {
      await Announcement.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Announcement deleted' });
    }

    return res.status(403).json({ message: 'Not authorized to delete this announcement' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements, getUserAnnouncements, deleteAnnouncement };
