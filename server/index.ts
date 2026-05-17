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

import fs from 'fs';

// Load environment variables before anything else
dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') });

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
app.use((req, _res, next) => {
  console.log(`📡 [${req.method}] ${req.path} | Origin: ${req.headers.origin}`);
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL ? process.env.CLIENT_URL.trim() : '',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(
      (allowed) => origin === allowed || allowed.replace(/\/$/, '') === origin
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
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

// Serve static assets if the dist folder is present
const distPath = path.resolve(import.meta.dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log('📦 Serving static assets from dist folder');
  app.use(express.static(distPath));
  
  // Safe fallback for React Router that avoids path-to-regexp wildcard parsing
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('⚠️ Static assets dist folder not found, skipping static serving');
}

// Unmatched API routes fallback
app.use('/api', notFound);

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

export default app;
