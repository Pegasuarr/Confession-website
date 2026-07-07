import app from './app';
import prisma from './services/prisma';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔄 Checking database connection...');
    await prisma.$connect();
    console.log('✅ PostgreSQL database connection established successfully.');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 CrushLink Backend listening on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database. Server shutting down.', error);
    process.exit(1);
  }
};

startServer();
