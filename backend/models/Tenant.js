// backend/models/Tenant.js
const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

module.exports = mongoose.model('Tenant', tenantSchema);