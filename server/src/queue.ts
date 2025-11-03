import { Queue, Worker, Job } from 'bullmq';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';
import { createLogger } from './telemetry.js';
import fetch from 'node-fetch';

const connection = { connection: config.redisUrl };

export interface TryOnPayload {
  jobId: string;
  portraitId: string;
  favoriteId: string;
  userId: string;
  assetUrl: string;
}

const logger = createLogger('queue');

export const tryOnQueue = new Queue<TryOnPayload>('try-on', connection);


export async function enqueueTryOn(payload: TryOnPayload) {
  await tryOnQueue.add('try-on', payload, {
    jobId: payload.jobId,
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: false,
  });
}

export function startWorker() {
  const worker = new Worker<TryOnPayload>(
    'try-on',
    async (job: Job<TryOnPayload>) => {
      logger.info({ jobId: job.id }, 'processing try-on job');
      await prisma.tryOnJob.update({
        where: { id: job.data.jobId },
        data: { status: 'PROCESSING' },
      });

      const response = await fetch(`${config.aiServiceUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portraitId: job.data.portraitId,
          wigAssetUrl: job.data.assetUrl,
          favoriteId: job.data.favoriteId,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`AI service error: ${message}`);
      }

      const result = (await response.json()) as { outputUrl: string };

      await prisma.tryOnJob.update({
        where: { id: job.data.jobId },
        data: {
          status: 'COMPLETED',
          outputUrl: result.outputUrl,
        },
      });

      logger.info({ jobId: job.id }, 'try-on job completed');
    },
    connection
  );

  worker.on('failed', async (job, err) => {
    logger.error({ jobId: job?.id, err }, 'try-on job failed');
    if (!job) return;
    await prisma.tryOnJob.update({
      where: { id: job.data.jobId },
      data: {
        status: 'FAILED',
        statusMessage: err.message,
      },
    });
  });

  return worker;
}
