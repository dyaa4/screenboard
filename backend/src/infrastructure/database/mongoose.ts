import mongoose from 'mongoose';
import logger from '../../utils/logger';

const connectDB = async () => {
  const timer = logger.startTimer('Database Connection');

  try {
    logger.system('Connecting to MongoDB', {
      host: process.env.MONGO_DB_URL ? '***' : 'undefined',
      appName: process.env.APP_NAME,
      dbName: process.env.DB_NAME
    });

    await mongoose.connect(
      process.env.MONGO_DB_URL as string,
      {
        appName: process.env.APP_NAME,
        dbName: process.env.DB_NAME,
      } as mongoose.ConnectOptions,
    );

    logger.success('MongoDB connected successfully', {
      appName: process.env.APP_NAME,
      dbName: process.env.DB_NAME
    }, 'Database');

    timer();

    // Database connection event listeners
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', error, 'Database');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected', {}, 'Database');
    });

    mongoose.connection.on('reconnected', () => {
      logger.success('MongoDB reconnected', {}, 'Database');
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB', error as Error, 'Database');
    process.exit(1);
  }
};

export default connectDB;
