import { Router } from 'express';
import crypto from 'crypto';
import { config } from '../config.js';

const uploadsRouter = Router();

uploadsRouter.post('/try-on', async (req, res, next) => {
  try {
    if (!config.s3Bucket) {
      return res.status(503).json({ message: 'Upload bucket not configured.' });
    }

    const { filename, contentType, size } = req.body as {
      filename: string;
      contentType: string;
      size: number;
    };

    if (!filename || !contentType) {
      return res.status(400).json({ message: 'Missing filename or content type.' });
    }

    if (size > 10 * 1024 * 1024) {
      return res.status(413).json({ message: 'File exceeds maximum size.' });
    }

    const key = `portraits/${Date.now()}-${crypto.randomUUID()}-${filename}`;
    const uploadUrl = `https://s3.amazonaws.com/${config.s3Bucket}/${key}`;

    res.json({
      uploadUrl,
      portraitId: key,
      expiresIn: 900,
    });
  } catch (error) {
    next(error);
  }
});

export default uploadsRouter;
