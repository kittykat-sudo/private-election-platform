const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Election = require('../models/Election');

// Create tenant (superadmin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { tenantId, name } = req.body;
  try {
    let tenant = await Tenant.findOne({ tenantId });
    if (tenant) return res.status(400).json({ message: 'Tenant already exists' });

    tenant = new Tenant({ tenantId, name });
    await tenant.save();
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tenants (superadmin only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tenant details with statistics
router.get('/:id', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Get statistics
    const userCount = await User.countDocuments({ tenantId: tenant.tenantId });
    const electionCount = await Election.countDocuments({ tenantId: tenant.tenantId });
    const adminCount = await User.countDocuments({ tenantId: tenant.tenantId, role: 'admin' });
    const voterCount = await User.countDocuments({ tenantId: tenant.tenantId, role: 'voter' });

    res.json({
      ...tenant.toObject(),
      statistics: {
        totalUsers: userCount,
        totalElections: electionCount,
        adminCount,
        voterCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tenant
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { name } = req.body;
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete tenant
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Delete all associated data
    await User.deleteMany({ tenantId: tenant.tenantId });
    await Election.deleteMany({ tenantId: tenant.tenantId });
    await tenant.deleteOne();

    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;