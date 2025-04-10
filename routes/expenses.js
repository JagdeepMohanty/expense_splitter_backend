const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');

router.post('/', auth, async (req, res) => {
  const { groupId, description, amount, participants, splitType } = req.body;
  try {
    if (splitType === 'percentage' && participants.reduce((sum, p) => sum + p.share, 0) !== 100) {
      return res.status(400).json({ msg: 'Percentages must add up to 100' });
    }

    const expense = new Expense({
      group: groupId,
      description,
      amount,
      payer: req.user.id,
      participants: splitType === 'equal'
        ? participants.map(p => ({ user: p, share: amount / participants.length }))
        : participants.map(p => ({ user: p.user, share: (p.share / 100) * amount })),
      splitType,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/settle', auth, async (req, res) => {
  const { to, amount, groupId, description } = req.body;
  try {
    const payment = new Payment({ from: req.user.id, to, amount, group: groupId, description });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/debts/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId }).populate('payer participants.user');
    const payments = await Payment.find({ group: req.params.groupId });

    const debts = {};
    expenses.forEach(exp => {
      exp.participants.forEach(p => {
        if (p.user._id.toString() !== exp.payer._id.toString()) {
          debts[p.user._id] = (debts[p.user._id] || 0) + p.share;
          debts[exp.payer._id] = (debts[exp.payer._id] || 0) - p.share;
        }
      });
    });
    payments.forEach(p => {
      debts[p.from] = (debts[p.from] || 0) - p.amount;
      debts[p.to] = (debts[p.to] || 0) + p.amount;
    });

    res.json(debts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/history/:groupId', auth, async (req, res) => {
  const { dateStart, dateEnd, member } = req.query;
  try {
    const query = { group: req.params.groupId };
    if (dateStart) query.createdAt = { $gte: new Date(dateStart) };
    if (dateEnd) query.createdAt = { ...query.createdAt, $lte: new Date(dateEnd) };
    if (member) query.$or = [{ payer: member }, { 'participants.user': member }];

    const expenses = await Expense.find(query).populate('payer participants.user');
    const payments = await Payment.find({ group: req.params.groupId }).populate('from to');

    res.json({ expenses, payments });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/reminders/:groupId', auth, async (req, res) => {
  try {
    const debts = await router.handle('get', '/debts/' + req.params.groupId, req, res);
    const reminders = Object.entries(debts).filter(([_, amount]) => amount > 0).map(([userId, amount]) => ({
      userId,
      amount,
    }));
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;