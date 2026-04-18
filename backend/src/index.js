/**
 * Main Backend Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';
import searchRoutes from './routes/searchRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
