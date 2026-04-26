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
    // Basic verification - check if user is head of this club could be added here
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

module.exports = { getEvents, createEvent, participateInEvent };
