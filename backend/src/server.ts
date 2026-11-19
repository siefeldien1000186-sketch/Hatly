import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './routes';
import { initSocket } from './services/socket.service';
import { errorHandler } from './middlewares/error.middleware';
import { autoSeedIfEmpty } from './seed';

const app = express();
const server = http.createServer(app);

// Trust Railway's reverse proxy for real IP detection (rate limiting)
app.set('trust proxy', 1);

// Initialize WebSockets
const io = initSocket(server);

// Standard Middlewares
const allowedOrigins = [
  'https://hatly-frontend-production.up.railway.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      config.corsOrigin === '*' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.up.railway.app') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting — generous window so testing and real users never get blocked
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'تجاوزت الحد المسموح به من محاولات تسجيل الدخول. حاول مجدداً بعد قليل.' },
});
app.use('/api/v1/auth/login', loginLimiter);

// General API rate limit — 200 req per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'طلبات كثيرة جداً. حاول مجدداً بعد قليل.' },
});
app.use('/api/v1', generalLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Hatly Super App Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    market: 'Egypt (EGP)',
  });
});

// Mount API routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

// Start listening
server.listen(config.port, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 Hatly Super App Server running on port ${config.port}`);
  console.log(`🌐 Base API: http://localhost:${config.port}/api/v1`);
  console.log(`⚡ WebSocket Server active on port ${config.port}`);
  console.log(`🇪🇬 Target Market: Egypt | Currency: EGP | Mode: ${config.nodeEnv}`);
  console.log('====================================================');

  // Ensure default seed data exists if database is newly initialized
  autoSeedIfEmpty().catch((err) => console.error('Auto-seed error:', err));
});

export default app;
