import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import apiRoutes from './routes/api.js';

const app = express();

// Security: Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parser with 2MB limit (code is further restricted to 50KB in route)
app.use(express.json({ limit: '2mb' }));

// Rate limiting middleware to prevent request flooding
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this client. Please wait a moment before trying again.'
  }
});
app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount CodeLens REST API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 CodeLens — AI Code Explainer & Debugger Server`);
  console.log(`📡 Listening on http://localhost:${config.port}`);
  console.log(`🤖 Local Ollama target: ${config.ollama.baseUrl} (Model: ${config.ollama.defaultModel})`);
  console.log(`🧪 Health check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
});
