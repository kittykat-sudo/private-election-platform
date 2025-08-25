const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Election = require('../models/Election');
const Vote = require('../models/Vote');

// Cast vote (voter only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'voter') return res.status(403).json({ message: 'Access denied' });

  const { electionId, candidate } = req.body;
  try {
    const election = await Election.findById(electionId);
    if (!election || election.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: 'Election not found' });
    }
    if (!election.voters.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to vote' });
    }
    if (election.status !== 'live') {
      return res.status(400).json({ message: 'Election not active' });
    }

    const existingVote = await Vote.findOne({ electionId, voterId: req.user.userId });
    if (existingVote) {
      return res.status(400).json({ message: 'Already voted' });
    }

    const voteHash = `hash_${electionId}_${req.user.userId}_${candidate}`;

    const vote = new Vote({
      tenantId: req.user.tenantId,
      electionId,
      voterId: req.user.userId,
      candidate,
      voteHash,
    });
    await vote.save();

    res.json({ message: 'Vote cast successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;