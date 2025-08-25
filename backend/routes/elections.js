const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Election = require('../models/Election');
const User = require('../models/User');
const Vote = require('../models/Vote');

// Create election (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const { title, description, startDate, endDate, candidates, isPublic } = req.body;
  try {
    const election = new Election({
      tenantId: req.user.tenantId,
      title,
      description,
      startDate,
      endDate,
      candidates,
      isPublic,
    });
    await election.save();
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all elections
router.get('/', auth, async (req, res) => {
  try {
    const query = { tenantId: req.user.tenantId };
    if (req.user.role === 'voter') {
      query.voters = req.user.userId;
    }
    const elections = await Election.find(query);
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single election
router.get('/:id', auth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('voters', 'name email');
    if (!election || election.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if user has voting access
    let canVote = false;
    if (req.user.role === 'voter') {
      canVote = election.voters.some(voter => voter._id.toString() === req.user.userId);
    }

    res.json({ ...election.toObject(), canVote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update election (admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const { title, description, startDate, endDate, candidates, isPublic, status } = req.body;
  try {
    const election = await Election.findById(req.params.id);
    if (!election || election.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { title, description, startDate, endDate, candidates, isPublic, status },
      { new: true }
    );
    res.json(updatedElection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add voters to election (admin only)
router.post('/:id/voters', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const { voterEmails } = req.body; // Array of emails
  try {
    const election = await Election.findById(req.params.id);
    if (!election || election.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const voters = await User.find({ 
      email: { $in: voterEmails }, 
      tenantId: req.user.tenantId,
      role: 'voter'
    });

    const voterIds = voters.map(voter => voter._id);
    const newVoterIds = voterIds.filter(id => !election.voters.includes(id));

    election.voters.push(...newVoterIds);
    
    // Add election to voters' election list
    await User.updateMany(
      { _id: { $in: newVoterIds } },
      { $push: { elections: election._id } }
    );

    await election.save();
    res.json({ message: `${newVoterIds.length} voters added successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove voter from election (admin only)
router.delete('/:id/voters/:voterId', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  try {
    const election = await Election.findById(req.params.id);
    if (!election || election.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: 'Election not found' });
    }

    election.voters = election.voters.filter(voterId => voterId.toString() !== req.params.voterId);
    await election.save();

    // Remove election from voter's list
    await User.findByIdAndUpdate(
      req.params.voterId,
      { $pull: { elections: election._id } }
    );

    res.json({ message: 'Voter removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get election results
router.get('/:id/results', auth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election || election.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if user can view results
    if (req.user.role === 'voter' && !election.isPublic) {
      return res.status(403).json({ message: 'Results not public yet' });
    }

    const votes = await Vote.find({ electionId: req.params.id });
    const results = {};
    
    votes.forEach(vote => {
      results[vote.candidate] = (results[vote.candidate] || 0) + 1;
    });

    const totalVotes = votes.length;
    const eligibleVoters = election.voters.length;

    res.json({
      results,
      totalVotes,
      eligibleVoters,
      turnout: eligibleVoters > 0 ? (totalVotes / eligibleVoters * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete election (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  try {
    const election = await Election.findById(req.params.id);
    if (!election || election.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Delete all votes for this election
    await Vote.deleteMany({ electionId: req.params.id });
    
    // Remove election from users' election lists
    await User.updateMany(
      { elections: req.params.id },
      { $pull: { elections: req.params.id } }
    );

    await election.deleteOne();
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;