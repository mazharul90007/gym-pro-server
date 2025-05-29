import express from 'express';
import { BookingControllers } from './booking.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../member/member.interface';

const router = express.Router();

// Route for a Trainee to book a class
router.post('/', auth(USER_ROLE.TRAINEE), BookingControllers.createBooking);

// Route for a Trainee to cancel their booking
router.patch(
  '/:id/cancel',
  auth(USER_ROLE.TRAINEE),
  BookingControllers.cancelBooking,
);

// Route for a Trainee to view their own bookings
router.get(
  '/my-bookings',
  auth(USER_ROLE.TRAINEE),
  BookingControllers.getTraineeBookings,
);

// Route for Admin to view all bookings
router.get('/', auth(USER_ROLE.ADMIN), BookingControllers.getAllBookings);

export const BookingRoutes = router;
