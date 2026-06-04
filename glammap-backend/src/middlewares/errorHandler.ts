// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/customErrors';
import logger from '../logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error({ err, method: req.method, url: req.url }, 'Unhandled error');

  return res.status(500).json({ message: 'Something went wrong' });
};
