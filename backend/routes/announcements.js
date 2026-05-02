const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, getUserAnnouncements, deleteAnnouncement } = require('../controllers/announcements');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get all announcements for the logged-in user's clubs
router.get('/user/all', protect, getUserAnnouncements);

router.route('/')
  .post(protect, authorizeRoles('club_head', 'admin'), createAnnouncement);

router.route('/:clubId')
  .get(protect, getAnnouncements);

// Delete announcement (club head or admin)
router.delete('/delete/:id', protect, authorizeRoles('club_head', 'admin'), deleteAnnouncement);

module.exports = router;
