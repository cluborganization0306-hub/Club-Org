const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/users');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, authorizeRoles('admin'), getUsers);

module.exports = router;
