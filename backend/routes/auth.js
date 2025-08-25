// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Public registration (voters only)
router.post('/register', async (req, res) => {
  const { tenantId, email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      tenantId,
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role: 'voter', // Force voter role for public registration
    });

    await user.save();

    const payload = { userId: user._id, tenantId, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin registration (admin/superadmin only)
router.post('/register-admin', auth, async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { tenantId, email, password, name, role } = req.body;
  if (!['voter', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      tenantId: req.user.role === 'superadmin' ? tenantId : req.user.tenantId, // Superadmin can set any tenantId
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role,
    });

    await user.save();

    const payload = { userId: user._id, tenantId: user.tenantId, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { userId: user._id, tenantId: user.tenantId, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;