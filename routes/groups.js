const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');

// ✅ Create a group
router.post('/', auth, async (req, res) => {
  const { name, memberIds } = req.body;
  try {
    const group = new Group({ name, members: memberIds, createdBy: req.user.id });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Get all groups where the user is a member
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Get one group by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
