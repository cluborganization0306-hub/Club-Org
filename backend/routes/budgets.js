const express = require('express');
const router = express.Router();
const { getBudget, updateBudget } = require('../controllers/budgets');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/:clubId')
  .get(protect, getBudget)
  .put(protect, authorizeRoles('club_head', 'admin'), updateBudget);

module.exports = router;
