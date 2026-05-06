// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/customErrors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Log the error for debugging purposes (console.log is a placeholder)
  console.error(err);

  return res.status(500).json({ message: 'Something went wrong' });
};
