const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  candidate: { type: String, required: true },
  voteHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vote', voteSchema);