const express = require('express');
const router = express.Router();
const { getClubs, createClub, assignClubHead, requestHead, approveRequest, rejectRequest } = require('../controllers/clubs');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getClubs)
  .post(protect, authorizeRoles('admin'), createClub);

router.route('/:id/assign-head')
  .put(protect, authorizeRoles('admin'), assignClubHead);

router.route('/:id/request')
  .post(protect, authorizeRoles('club_head'), requestHead);

router.route('/:id/approve-request')
  .post(protect, authorizeRoles('admin'), approveRequest);

router.route('/:id/reject-request')
  .post(protect, authorizeRoles('admin'), rejectRequest);

module.exports = router;
