const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  amount: { type: Number, required: true, default: 0 },
  expenses: [{
    description: String,
    cost: Number,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
