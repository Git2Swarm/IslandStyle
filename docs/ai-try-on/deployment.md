# AI Try-On Deployment Guide

This document describes how to deploy the wig try-on experience across two tracks: the in-browser demo that ships today, and the future backend + AI services.

## Demo quick start
1. Serve the repository with any static web server (for example, `python3 -m http.server 4173`).
2. Visit `http://localhost:4173/try-on.html` to upload your own portrait or use the included sample.
3. Edit `assets/js/try-on-data.js` to swap in catalog wigs, adjust default positioning, or change the sample portrait.

No external credentials are required for the demo—everything runs client-side.

## Prerequisites
- AWS account with IAM roles for S3, SQS (or Redis Elasticache), Lambda, and CloudFront.
- Docker and docker-compose installed locally.
- Redis instance for BullMQ job queue.
- PostgreSQL database for favorites and job metadata.
- GitHub repository access with Actions enabled for CI/CD.

## Production infrastructure overview
1. **Frontend (Static Hosting):** Build the static site (including `try-on.html`) and deploy to S3 + CloudFront or Netlify.
2. **Orchestration Service:** Deploy the Node.js service to ECS Fargate or Kubernetes. The service exposes REST APIs for favorites, uploads, and job status.
3. **AI Microservice:** Deploy the FastAPI container to GPU-enabled ECS/K8s node group. Attach EFS or S3 access for wig assets and model weights.
4. **Redis Queue:** Provision Redis (Elasticache) for BullMQ. Configure security groups for access from the orchestration service.
5. **PostgreSQL:** Host via RDS or managed Postgres for favorites and job persistence.
6. **Observability:** Ship logs to CloudWatch, metrics to Prometheus/Grafana, traces to AWS X-Ray or OTEL collector.

## Production environment variables
Copy `.env.example` to `.env` for local development. Key values:
- `PORT`: HTTP port for Node service.
- `DATABASE_URL`: Postgres connection string.
- `REDIS_URL`: Redis endpoint.
- `S3_BUCKET`: Storage bucket for uploads/results.
- `AI_SERVICE_URL`: Base URL for FastAPI generator.
- `MODERATION_ENDPOINT`: Optional content moderation API endpoint.
- `JWT_SECRET`: Authentication secret.

## Production deployment steps
1. **Build Containers**
   ```bash
   docker build -t islandstyle/orchestrator ./server
   docker build -t islandstyle/ai-service ./ai-service
   ```
2. **Push Images** to container registry (ECR/GCR).
3. **Apply Infrastructure** using Terraform or CloudFormation templates (not included). Ensure networking between services.
4. **Run Database Migrations** with Prisma: `npm run migrate` from `server/` once the database is accessible.
5. **Configure Secrets** in the orchestration task definition (DB URL, Redis, AWS credentials, AI URL, moderation keys).
6. **Deploy Frontend** by uploading built static assets to hosting provider.
7. **Smoke Test** the `/try-on` page, upload flow, job creation, and AI responses in staging.
8. **Enable Observability** by verifying metrics dashboards, log ingestion, and alerts.
9. **Launch Feature Flag** to a subset of users, gather feedback, then roll out broadly.

## Production rollback plan
- Redeploy previous container images and static assets.
- Restore database from latest snapshot.
- Invalidate CloudFront cache for stale assets.
- Disable feature flag while investigating.

## Production post-launch checklist
- Monitor queue depth and AI latency.
- Review moderation logs daily during initial rollout.
- Capture user feedback via analytics events and support forms.
- Schedule model re-training cadence and data retention review.
