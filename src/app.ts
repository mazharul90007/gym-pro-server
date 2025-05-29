import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';

import { MemberRoutes } from './app/modules/member/member.route';
import { ClassRoutes } from './app/modules/class/class.route';
import { AuthRoutes } from './app/modules/auth/auth.route';
import { BookingRoutes } from './app/modules/booking/booking.route';

// Error Handleing middleware
import globalErrorHandler from './middlewares/globalErrorHandler';
import { catchAsync } from './utils/catchAsync';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/members', MemberRoutes);
app.use('/api/v1/classes', ClassRoutes);
app.use('/api/v1/bookings', BookingRoutes);

// Root Route
app.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    res.status(httpStatus.OK).send('Gym-Pro');
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API Not Found!',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'Your requested API is not found!',
      },
    ],
  });
});

app.use(globalErrorHandler);

export default app;
