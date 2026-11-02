const express = require('express');
const logger = require('./src/middleware/logger');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to User Profile API' });
});

app.use('/api/users', userRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'User already exists' });
  }
  if (error.code === 'P2003' || error.code === 'P2023') {
    return res.status(400).json({ message: 'Invalid user data' });
  }
  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
