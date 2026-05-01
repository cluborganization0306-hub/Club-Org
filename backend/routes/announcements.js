const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcements');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorizeRoles('club_head', 'admin'), createAnnouncement);

router.route('/:clubId')
  .get(protect, getAnnouncements);

module.exports = router;
