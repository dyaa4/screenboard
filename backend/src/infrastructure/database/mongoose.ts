import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_DB_URL as string,
      {
        appName: process.env.APP_NAME,
        dbName: process.env.DB_NAME,
      } as mongoose.ConnectOptions,
    );
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
