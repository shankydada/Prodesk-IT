import mongoose from 'mongoose';
import { env, isProduction } from './env.js';

export const DB_MODE = { MONGO: 'mongodb', MEMORY: 'in-memory' };

let activeMode = DB_MODE.MEMORY;

export const getDatabaseMode = () => (mongoose.connection.readyState === 1 ? DB_MODE.MONGO : activeMode);

/**
 * Connects to MongoDB Atlas/local when MONGODB_URI is present.
 * Falls back to an in-memory repository (development only) so the API and the
 * whole CRUD pipeline stay demonstrable without a database daemon running.
 */
export async function connectDatabase() {
  if (!env.mongoUri) {
    activeMode = DB_MODE.MEMORY;
    console.warn(
      '[db] MONGODB_URI is not set -> running in IN-MEMORY mode. ' +
        'Documents vanish on restart. Set MONGODB_URI in .env for real persistence.',
    );
    return activeMode;
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.info('[db] MongoDB reconnected'));
  mongoose.connection.on('error', (error) => console.error('[db] MongoDB error:', error.message));

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });
    activeMode = DB_MODE.MONGO;
    console.info(`[db] Connected to MongoDB (${mongoose.connection.name})`);
    return activeMode;
  } catch (error) {
    console.error(`[db] MongoDB connection failed: ${error.message}`);
    if (isProduction) {
      // A deployed server silently dropping writes onto a fake store is worse than crashing.
      console.error('[db] MONGODB_URI is set but unreachable - refusing to start in production.');
      process.exit(1);
    }
    activeMode = DB_MODE.MEMORY;
    console.warn('[db] Falling back to IN-MEMORY mode (development only).');
    return activeMode;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}
