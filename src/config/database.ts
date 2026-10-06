import mongoose from 'mongoose';

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => console.log('[database] connected'));
  mongoose.connection.on('disconnected', () => console.log('[database] disconnected'));
  mongoose.connection.on('error', (error: Error) => console.error('[database] error:', error.message));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
