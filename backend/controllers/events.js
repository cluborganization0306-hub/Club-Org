const Event = require('../models/Event');
const Club = require('../models/Club');

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('clubId', 'clubName')
      .populate('participants', 'name email prn department year');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new event (Club Head)
const createEvent = async (req, res) => {
  const { title, description, date, clubId } = req.body;
  try {
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    // Check if the user is the head of this club or an admin
    if (req.user.role !== 'admin' && (!club.clubHeadId || !club.clubHeadId.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to create event for this club' });
    }

    // Conflict Detection: check if any event is scheduled within 1 hour
    const eventDate = new Date(date);
    const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(eventDate.getTime() + 60 * 60 * 1000);
    
    const conflict = await Event.findOne({
      date: { $gte: oneHourBefore, $lte: oneHourAfter }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Conflict: Another event is scheduled within 1 hour of this time.' });
    }

    const newEvent = await Event.create({ title, description, date, clubId });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Participate in an event (Student)
const participateInEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already participated' });
    }
    
    event.participants.push(req.user._id);
    await event.save();
    
    res.json({ message: 'Successfully participated in event', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark attendance (Student scans QR code)
const markAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }
    
    event.attendees.push(req.user._id);
    await event.save();
    
    res.json({ message: 'Successfully marked attendance!', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, createEvent, participateInEvent, markAttendance };
