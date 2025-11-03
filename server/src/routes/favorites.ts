import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const favoritesRouter = Router();

favoritesRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.id ?? 'demo-user';
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(
      favorites.map((favorite) => ({
        id: favorite.id,
        name: favorite.name,
        color: favorite.color,
        thumb: favorite.thumbUrl,
        assetUrl: favorite.assetUrl,
      }))
    );
  } catch (error) {
    next(error);
  }
});

favoritesRouter.put('/', async (req, res, next) => {
  try {
    const userId = req.user?.id ?? 'demo-user';
    const favorites = req.body as Array<{
      id: string;
      name: string;
      color?: string;
      thumb?: string;
      assetUrl?: string;
    }>;

    await prisma.$transaction(
      favorites.map((favorite) =>
        prisma.favorite.update({
          where: { id: favorite.id },
          data: {
            name: favorite.name,
            color: favorite.color,
            thumbUrl: favorite.thumb,
            assetUrl: favorite.assetUrl ?? '',
          },
        })
      )
    );

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default favoritesRouter;
