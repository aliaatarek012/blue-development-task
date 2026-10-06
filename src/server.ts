import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { createTaskModule } from './modules/tasks/task.module';

async function bootstrap(): Promise<void> {
  await connectDatabase(env.mongodbUri);

  const app = createApp({
    modules: [createTaskModule()],
    corsOrigin: env.corsOrigin,
  });

  const server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
    console.log(`[server] swagger docs at http://localhost:${env.port}/api/docs`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(() => {
      disconnectDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('[server] failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
});
