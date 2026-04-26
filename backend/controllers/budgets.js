const Budget = require('../models/Budget');
const Club = require('../models/Club');

// Get budget for a club
const getBudget = async (req, res) => {
  const { clubId } = req.params;
  try {
    let budget = await Budget.findOne({ clubId });
    if (!budget) {
      budget = await Budget.create({ clubId, amount: 0, expenses: [] });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add expense / update budget (Club Head)
const updateBudget = async (req, res) => {
  const { clubId } = req.params;
  const { amount, expenseDescription, expenseCost } = req.body;
  
  try {
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    // Check if the user is the head of this club or an admin
    if (req.user.role !== 'admin' && (!club.clubHeadId || !club.clubHeadId.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to update budget for this club' });
    }

    let budget = await Budget.findOne({ clubId });
    if (!budget) {
       budget = new Budget({ clubId, amount: amount || 0, expenses: [] });
    } else {
       if (amount !== undefined) budget.amount = amount;
    }
    
    if (expenseDescription && expenseCost) {
       budget.expenses.push({ description: expenseDescription, cost: expenseCost });
    }
    
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudget, updateBudget };
