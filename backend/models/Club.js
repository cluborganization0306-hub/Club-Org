const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  clubName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  clubHeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
