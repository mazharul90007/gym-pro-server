// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import globalErrorHandler from './middlewares/globalErrorHandler';
import { MemberRoutes } from './app/modules/member/member.route';
import { ClassRoutes } from './app/modules/class/class.route';

const app: Application = express();

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware
app.use(express.json());
app.use(cors());

//Application Routes
app.use('/api/v1/members', MemberRoutes);
app.use('/api/v1/classes', ClassRoutes);

//Root Route
app.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    res.send(
      'Gym Class Scheduling and Membership Management System API (No Auth)!',
    );
  }),
);

//Global Error Handling Middleware
app.use(globalErrorHandler);

//Not Found Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Not Found!',
    errorDetails: {
      path: req.originalUrl,
      message: 'Your requested API is not found!',
    },
  });
});

export default app;
