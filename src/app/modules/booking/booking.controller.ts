import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { TBookingCreateInput, TBookingQuery } from './booking.interface';
import { catchAsync } from '../../../utils/catchAsync';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

interface AuthenticatedRequest extends Request {
  user?: {
    memberId: string;
    email: string;
    role: 'admin' | 'trainer' | 'trainee';
  };
}

const createBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const memberId = req.user?.memberId;
    if (!memberId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated.');
    }

    const { classId }: TBookingCreateInput = req.body;
    if (!classId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Class ID is required to book a class.',
      );
    }

    const result = await BookingService.createBookingInDB(
      { classId },
      memberId,
    );
    res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Class booked successfully',
      data: result,
    });
  },
);

const cancelBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id: bookingId } = req.params;
    const memberId = req.user?.memberId;

    if (!memberId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated.');
    }
    if (!bookingId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Booking ID is required to cancel a booking.',
      );
    }

    const result = await BookingService.cancelBookingInDB(bookingId, memberId);
    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: 'Booking cancelled successfully',
      data: result,
    });
  },
);

const getTraineeBookings = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const memberId = req.user?.memberId;
    if (!memberId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated.');
    }

    const query: TBookingQuery = req.query;

    const result = await BookingService.getTraineeBookingsFromDB(
      memberId,
      query,
    );
    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: 'Trainee bookings retrieved successfully',
      data: result,
    });
  },
);

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const query: TBookingQuery = req.query;
  const result = await BookingService.getAllBookingsFromDB(query);
  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: 'All bookings retrieved successfully',
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  cancelBooking,
  getTraineeBookings,
  getAllBookings,
};
