require('dotenv').config();
const app = require('./app');
const prisma = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be set before starting the API');
    }

    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start API:', error);
    await prisma.$disconnect();
    process.exitCode = 1;
  }
};

start();
