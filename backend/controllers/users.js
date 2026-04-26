const User = require('../models/User');

// Get users based on role query (or all users)
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers };
