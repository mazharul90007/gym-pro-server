import { Types } from 'mongoose';
import { addMinutes, startOfDay, endOfDay } from 'date-fns';

import {
  IBooking,
  TBookingCreateInput,
  TBookingQuery,
  BOOKING_STATUS,
} from './booking.interface';
import { Booking } from './booking.model';
import { Class } from '../class/class.model';
import { Member } from '../member/member.model';
import { USER_ROLE } from '../member/member.interface';
import { IClass } from '../class/class.interface';

import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const createBookingInDB = async (
  payload: TBookingCreateInput,
  memberId: string,
): Promise<IBooking> => {
  const { classId } = payload;

  const classToBook = await Class.findById(classId);
  if (!classToBook || classToBook.isDeleted || !classToBook.isAvailable) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Class not found or not available for booking!',
    );
  }

  const trainee = await Member.findById(memberId);
  if (!trainee || trainee.isDeleted || trainee.role !== USER_ROLE.TRAINEE) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only trainees can book classes. Your account is not authorized.',
    );
  }

  if (classToBook.currentBookings >= classToBook.maxCapacity) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Class schedule is full. Maximum 10 trainees allowed per schedule.',
    );
  }

  const newClassStartTime = classToBook.scheduledTime;
  const newClassEndTime = addMinutes(
    newClassStartTime,
    classToBook.durationMinutes,
  );

  const existingConfirmedBookings = await Booking.find({
    member: new Types.ObjectId(memberId),
    status: BOOKING_STATUS.CONFIRMED,
    isDeleted: false,
  }).populate('class');

  for (const booking of existingConfirmedBookings) {
    const bookedClass = booking.class as IClass;

    if (
      !bookedClass ||
      !bookedClass.scheduledTime ||
      typeof bookedClass.durationMinutes === 'undefined'
    ) {
      console.warn(
        `Skipping booking overlap check for malformed class data in booking ID: ${booking._id}`,
      );
      continue;
    }

    const existingClassStartTime = bookedClass.scheduledTime;
    const existingClassEndTime = addMinutes(
      existingClassStartTime,
      bookedClass.durationMinutes,
    );

    const overlap =
      newClassStartTime < existingClassEndTime &&
      existingClassStartTime < newClassEndTime;

    if (overlap) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `You already have a booking for "${bookedClass.name}" that overlaps with this time slot!`,
      );
    }
  }

  const newBooking = await Booking.create({
    class: new Types.ObjectId(classId),
    member: new Types.ObjectId(memberId),
    bookingDate: new Date(),
    status: BOOKING_STATUS.CONFIRMED,
    isDeleted: false,
  });

  await Class.findByIdAndUpdate(
    classId,
    { $inc: { currentBookings: 1 } },
    { new: true, runValidators: true },
  );

  const result = await Booking.findById(newBooking._id)
    .populate('class')
    .populate('member');

  return result as IBooking;
};

const cancelBookingInDB = async (
  bookingId: string,
  memberId: string,
): Promise<IBooking | null> => {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Booking ID.');
  }

  const bookingToCancel = await Booking.findOne({
    _id: bookingId,
    member: new Types.ObjectId(memberId),
    status: BOOKING_STATUS.CONFIRMED,
    isDeleted: false,
  });

  if (!bookingToCancel) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Booking not found, already cancelled, or you are not authorized to cancel it!',
    );
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: BOOKING_STATUS.CANCELLED, isDeleted: true },
    { new: true },
  );

  if (!updatedBooking) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update booking status.',
    );
  }

  await Class.findByIdAndUpdate(
    updatedBooking.class,
    { $inc: { currentBookings: -1 } },
    { new: true, runValidators: true },
  );

  const result = await Booking.findById(updatedBooking._id)
    .populate('class')
    .populate('member');

  return result;
};

const getTraineeBookingsFromDB = async (
  memberId: string,
  query: TBookingQuery,
): Promise<IBooking[]> => {
  const trainee = await Member.findById(memberId);
  if (!trainee || trainee.isDeleted || trainee.role !== USER_ROLE.TRAINEE) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only trainees can view their own bookings. Your account is not authorized.',
    );
  }

  const filter: any = {
    member: new Types.ObjectId(memberId),
    isDeleted: false,
  };

  if (query.classId) {
    filter.class = new Types.ObjectId(query.classId);
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.date) {
    const queryDate = new Date(query.date);
    if (isNaN(queryDate.getTime())) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid date format for query. Use YYYY-MM-DD.',
      );
    }
    const classesOnDate = await Class.find({
      scheduledTime: {
        $gte: startOfDay(queryDate),
        $lte: endOfDay(queryDate),
      },
      isDeleted: false,
    }).select('_id');

    const classIds = classesOnDate.map((c) => c._id);

    if (classIds.length === 0) {
      return [];
    }

    filter.class = { $in: classIds };
  }

  const result = await Booking.find(filter)
    .populate('class')
    .populate('member');
  return result;
};

const getAllBookingsFromDB = async (
  query: TBookingQuery,
): Promise<IBooking[]> => {
  const filter: any = { isDeleted: false };

  if (query.memberId) {
    filter.member = new Types.ObjectId(query.memberId);
  }
  if (query.classId) {
    filter.class = new Types.ObjectId(query.classId);
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.date) {
    const queryDate = new Date(query.date);
    if (isNaN(queryDate.getTime())) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid date format for query. Use YYYY-MM-DD.',
      );
    }
    const classesOnDate = await Class.find({
      scheduledTime: {
        $gte: startOfDay(queryDate),
        $lte: endOfDay(queryDate),
      },
      isDeleted: false,
    }).select('_id');

    const classIds = classesOnDate.map((c) => c._id);
    if (classIds.length === 0) {
      return [];
    }
    filter.class = { $in: classIds };
  }

  const result = await Booking.find(filter)
    .populate('class')
    .populate('member');
  return result;
};

export const BookingService = {
  createBookingInDB,
  cancelBookingInDB,
  getTraineeBookingsFromDB,
  getAllBookingsFromDB,
};
