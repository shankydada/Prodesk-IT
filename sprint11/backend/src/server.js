import app from './app.js';
import { env, isCloudinaryConfigured } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { storageProvider } from './utils/assetStorage.js';

const start = async () => {
  const dbMode = await connectDatabase();

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.info(
      [
        '',
        '  Sprint 11 API ready',
        `  ├─ Listening      http://localhost:${env.port}`,
        `  ├─ Health         http://localhost:${env.port}/api/health`,
        `  ├─ Database       ${dbMode}`,
        `  ├─ Asset storage  ${storageProvider()}${isCloudinaryConfigured ? '' : ' (dev fallback)'}`,
        `  ├─ Allowed CORS   ${env.allowedOrigins.join(', ') || 'localhost patterns only'}`,
        `  └─ Environment    ${env.nodeEnv}`,
        '',
      ].join('\n'),
    );
  });

  const shutdown = async (signal) => {
    console.info(`\n[server] ${signal} received - shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled rejection:', reason);
  });
};

start().catch((error) => {
  console.error('[server] Fatal startup error:', error);
  process.exit(1);
});
