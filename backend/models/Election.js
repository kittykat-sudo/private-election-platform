const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  candidates: [{
    name: { type: String, required: true },
    description: { type: String },
  }],
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  results: [{ candidate: String, votes: Number }],
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  contractAddress: { type: String },
  isPublic: { type: Boolean, default: false }, // For result visibility
});

module.exports = mongoose.model('Election', electionSchema);