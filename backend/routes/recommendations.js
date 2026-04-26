const express = require('express');
const router = express.Router();
const { getRecommendedClubs } = require('../controllers/recommendations');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRecommendedClubs);

module.exports = router;
