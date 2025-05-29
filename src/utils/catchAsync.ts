import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (
  _req: Request,
  _res: Response,
  _next: NextFunction,
) => Promise<any>;

export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
