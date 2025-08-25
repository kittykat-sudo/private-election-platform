// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');
const tenantRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Election Platform API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});