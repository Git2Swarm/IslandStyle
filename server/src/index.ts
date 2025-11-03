import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import favoritesRouter from './routes/favorites.js';
import tryOnRouter from './routes/tryOn.js';
import uploadsRouter from './routes/uploads.js';
import { createLogger } from './telemetry.js';
import { startWorker } from './queue.js';

const app = express();
const logger = createLogger('api');

app.use(cors());
app.use(express.json({ limit: '11mb' }));

app.use((req, _res, next) => {
  // TODO: Replace with real auth middleware
  req.user = { id: 'demo-user' };
  next();
});

app.use('/api/favorites', favoritesRouter);
app.use('/api/try-on', tryOnRouter);
app.use('/api/uploads', uploadsRouter);

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err: error }, 'Unhandled error');
  res.status(500).json({ message: error.message });
});

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'try-on api listening');
});

startWorker();

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully');
  server.close(() => process.exit(0));
});
