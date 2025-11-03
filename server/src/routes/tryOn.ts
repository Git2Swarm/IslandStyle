import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { enqueueTryOn } from '../queue.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const userId = req.user?.id ?? 'demo-user';
    const { portraitId, favoriteId } = req.body as {
      portraitId: string;
      favoriteId: string;
    };

    if (!portraitId || !favoriteId) {
      return res.status(400).json({ message: 'portraitId and favoriteId are required.' });
    }

    const favorite = await prisma.favorite.findUnique({ where: { id: favoriteId } });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    const job = await prisma.tryOnJob.create({
      data: {
        userId,
        favoriteId,
        portraitId,
        status: 'QUEUED',
      },
    });

    await enqueueTryOn({
      jobId: job.id,
      portraitId,
      favoriteId,
      userId,
      assetUrl: favorite.assetUrl,
    });

    res.status(202).json({
      id: job.id,
      favoriteId,
      wigName: favorite.name,
      status: 'queued',
      createdAt: job.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await prisma.tryOnJob.findUnique({
    where: { id: req.params.id },
    include: { favorite: true },
  });
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    res.json({
      id: job.id,
      favoriteId: job.favoriteId,
      wigName: job.favorite?.name ?? job.favoriteId,
      status: job.status.toLowerCase(),
      outputUrl: job.outputUrl,
      error: job.statusMessage,
      createdAt: job.createdAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
