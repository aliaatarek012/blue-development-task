import cors from 'cors';
import express, { type Express, type Router } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { sendSuccess } from './common/responses/api-response';
import { buildSwaggerSpec } from './docs/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const API_PREFIX = '/api';

export interface FeatureModule {
  basePath: string;
  router: Router;
}

export interface AppOptions {
  modules: FeatureModule[];
  corsOrigin: string;
}

export function createApp({ modules, corsOrigin }: AppOptions): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    sendSuccess(res, { status: 'ok' });
  });

  app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(buildSwaggerSpec(API_PREFIX)));

  for (const module of modules) {
    app.use(`${API_PREFIX}${module.basePath}`, module.router);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
