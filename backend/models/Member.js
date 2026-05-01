const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional link to User
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  position: { type: String, default: 'Member' }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
