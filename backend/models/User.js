const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin', 'superadmin'], default: 'voter' },
  name: { type: String, required: true },
  elections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }],
});

module.exports = mongoose.model('User', userSchema);