const express = require('express');
const router = express.Router();
const { getMembers, enrollMember, getMyMemberships, approveMember, removeMember, updatePosition } = require('../controllers/members');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/my-memberships')
  .get(protect, authorizeRoles('student'), getMyMemberships);

router.route('/:clubId')
  .get(protect, getMembers);

router.route('/')
  .post(protect, authorizeRoles('club_head', 'admin', 'student'), enrollMember);

router.route('/:id/approve')
  .put(protect, authorizeRoles('club_head', 'admin'), approveMember);

router.route('/:id/remove')
  .delete(protect, authorizeRoles('club_head', 'admin'), removeMember);

router.route('/:id/position')
  .put(protect, authorizeRoles('club_head', 'admin'), updatePosition);

module.exports = router;
