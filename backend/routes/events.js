const express = require('express');
const router = express.Router();
const { getEvents, createEvent, participateInEvent } = require('../controllers/events');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getEvents)
  .post(protect, authorizeRoles('club_head', 'admin'), createEvent);

router.route('/:id/participate')
  .post(protect, authorizeRoles('student'), participateInEvent);

module.exports = router;
