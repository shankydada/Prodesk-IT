import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';

import { env, isProduction } from './config/env.js';
import postRoutes from './routes/postRoutes.js';
import { getHealth } from './controllers/postController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

/* --------------------------------------------------------------------------
 * Sprint 11 Phase 1 - CORS resolution (FAQ #5)
 * ------------------------------------------------------------------------ */
const DEV_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i, // Vercel preview + production domains
  /^https:\/\/[a-z0-9-]+\.netlify\.app$/i,
  /^https:\/\/[a-z0-9-]+\.onrender\.com$/i,
  /^https:\/\/[a-z0-9-]+\.e2b\.app$/i, // sandbox live preview host
];

export const isOriginAllowed = (origin) => {
  if (!origin) return true; // curl / Postman / server-to-server
  if (env.allowedOrigins.includes(origin)) return true;
  return DEV_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }
    // Mirrors the browser console wording so the terminal can be screenshotted for support calls.
    console.warn(
      `[cors] BLOCKED ${origin} -> Access to fetch has been blocked by CORS policy. ` +
        `Add it to ALLOWED_ORIGINS (current: ${env.allowedOrigins.join(', ') || 'none'}).`,
    );
    callback(new Error(`CORS: origin ${origin} is not allowed by ALLOWED_ORIGINS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ------------------------------- middleware ------------------------------ */
app.use(morgan(isProduction ? 'combined' : 'dev'));
// FAQ #7: without this, req.body is undefined on JSON POSTs.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve locally-stored dev uploads. In production the CDN serves these instead.
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

/* --------------------------------- routes -------------------------------- */
app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'Sprint 11 Fullstack API',
    endpoints: ['GET /api/health', 'GET /api/posts', 'POST /api/posts', 'GET /api/posts/:id', 'DELETE /api/posts/:id'],
  });
});

app.use('/api/health', getHealth);
app.use('/api/posts', postRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
