const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'club_head', 'admin'], default: 'student' },
  prn: { type: String },
  department: { type: String },
  year: { type: Number, enum: [1, 2, 3, 4] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
