import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/database';
import { logger } from './config/logger';

// Initialize environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// HTTP request logging
app.use(morgan('dev', { stream: { write: (message) => logger.http(message.trim()) } }));

// Define port
const PORT = process.env.PORT || 4000;

// Basic routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'RubyRokit API is running' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});