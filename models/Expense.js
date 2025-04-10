const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  payer: { type: Schema.Types.ObjectId, ref: 'User' },
  participants: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, share: Number }],
  splitType: { type: String, enum: ['equal', 'percentage'], default: 'equal' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);