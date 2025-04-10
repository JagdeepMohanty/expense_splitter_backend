const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User' },
  to: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);