import mongoose from 'mongoose';
import { Logger } from './logger';

// Load MongoDB URI from environment variable
const MONGODB_URI: string= process.env.MONGODB_URI  ?? '';
if (MONGODB_URI=='') {
  throw new Error('MONGODB_URI is not set in the environment variables. Please add it to your .env file.');
}

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    Logger.info('Connected to MongoDB successfully');
  } catch (error) {
    Logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    Logger.info('Disconnected from MongoDB');
  } catch (error) {
    Logger.error('Error disconnecting from MongoDB:', error);
  }
}

// Handle connection events
mongoose.connection.on('error', (error) => {
  Logger.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  Logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  Logger.info('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
}); 