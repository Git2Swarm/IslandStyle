import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  s3Bucket: process.env.S3_BUCKET ?? '',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
  moderationEndpoint: process.env.MODERATION_ENDPOINT,
  jwtSecret: process.env.JWT_SECRET ?? 'replace-me',
};

if (!config.databaseUrl) {
  console.warn('[config] DATABASE_URL is not set. Prisma client will fail to connect.');
}

if (!config.s3Bucket) {
  console.warn('[config] S3_BUCKET is not configured. Signed uploads will be disabled.');
}
