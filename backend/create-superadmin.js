const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = new User({
      tenantId: 'master',
      email: 'superadmin@election.com',
      password: await bcrypt.hash('superadmin123', 10),
      name: 'Super Admin',
      role: 'superadmin',
    });
    await user.save();
    console.log('Super Admin created');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

createSuperAdmin();