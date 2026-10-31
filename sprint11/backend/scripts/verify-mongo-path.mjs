/**
 * Boots a throwaway MongoDB (mongodb-memory-server) and starts the API against it,
 * so the Mongoose code path - schema validation, ObjectId casting, toJSON mapping -
 * is exercised exactly as it will be on Render with Atlas.
 *
 * Usage: node scripts/verify-mongo-path.mjs   (Ctrl+C to stop)
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create({ instance: { dbName: 'sprint11' } });
const uri = mongod.getUri('sprint11');

console.info(`[verify] ephemeral MongoDB ready at ${uri}`);
process.env.MONGODB_URI = uri;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { default: app } = await import('../src/app.js');
const { connectDatabase } = await import('../src/config/db.js');
const { env } = await import('../src/config/env.js');

const mode = await connectDatabase();
console.info(`[verify] API database mode: ${mode}`);

const server = app.listen(env.port, '0.0.0.0', () => {
  console.info(`[verify] API listening on http://localhost:${env.port} (Ctrl+C to stop)`);
});

const shutdown = async () => {
  server.close(async () => {
    await mongod.stop();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
