const Member = require('../models/Member');
const Club = require('../models/Club');

// Get members of a club
const getMembers = async (req, res) => {
  const { clubId } = req.params;
  try {
    const members = await Member.find({ clubId }).populate('userId', 'name email prn department year');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's memberships
const getMyMemberships = async (req, res) => {
  try {
    const memberships = await Member.find({ userId: req.user._id }).populate('clubId', 'clubName logoUrl');
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enroll a new member (Club Head) or self-join (Student)
const enrollMember = async (req, res) => {
  let { clubId, name, email, userId } = req.body;
  
  if (req.user.role === 'student') {
    name = req.user.name;
    email = req.user.email;
    userId = req.user._id;
  }

  try {
    const existing = await Member.findOne({ clubId, userId });
    if (existing) {
      return res.status(400).json({ message: 'Already a member of this club' });
    }

    const newMember = await Member.create({ clubId, name, email, userId });
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a member
const approveMember = async (req, res) => {
  const { id } = req.params;
  try {
    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    const club = await Club.findById(member.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (req.user.role !== 'admin' && (!club.clubHeadId || club.clubHeadId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to approve members for this club' });
    }

    member.status = 'approved';
    await member.save();
    res.json({ message: 'Member approved successfully', member });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove or reject a member
const removeMember = async (req, res) => {
  const { id } = req.params;
  try {
    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const club = await Club.findById(member.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (req.user.role !== 'admin' && (!club.clubHeadId || club.clubHeadId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to remove members for this club' });
    }

    await Member.findByIdAndDelete(id);
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update member position
const updatePosition = async (req, res) => {
  const { id } = req.params;
  const { position } = req.body;
  try {
    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    const club = await Club.findById(member.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (req.user.role !== 'admin' && (!club.clubHeadId || club.clubHeadId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to modify members for this club' });
    }

    member.position = position;
    await member.save();
    res.json({ message: 'Position updated successfully', member });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMembers, enrollMember, getMyMemberships, approveMember, removeMember, updatePosition };
