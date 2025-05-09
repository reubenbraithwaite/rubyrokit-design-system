import mongoose from 'mongoose';
import { logger } from './logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo:27017/rubyrokit';
    const options = {
      // useNewUrlParser and useUnifiedTopology are no longer needed in mongoose 6+
    };

    await mongoose.connect(mongoURI);
    
    logger.info('MongoDB connected successfully');
    
    // Set up event listeners for connection
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
