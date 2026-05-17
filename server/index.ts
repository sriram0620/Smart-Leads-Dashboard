import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './db/connection';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import analyticsRoutes from './routes/analytics';
import { errorHandler, notFound } from './middleware/errorHandler';
import { seedDatabase } from './utils/seedData';

// Load environment variables before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─── Startup Validation ─────────────────────────────────────────────────────────

const validateEnv = (): void => {
  const required = ['JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Create a .env file based on .env.example');
    process.exit(1);
  }
};

validateEnv();

// ─── Express App Setup ──────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// ─── Server Start ───────────────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
