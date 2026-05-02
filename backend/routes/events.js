const express = require('express');
const router = express.Router();
const { getEvents, createEvent, participateInEvent, markAttendance, deleteEvent } = require('../controllers/events');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getEvents);
router.post('/', protect, authorizeRoles('club_head', 'admin'), createEvent);

// Delete event (club head or admin)
router.delete('/:id', protect, authorizeRoles('club_head', 'admin'), deleteEvent);

router.route('/:id/participate')
  .post(protect, authorizeRoles('student'), participateInEvent);

router.route('/:id/attend')
  .put(protect, authorizeRoles('student'), markAttendance);

module.exports = router;
