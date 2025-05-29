import { Model, Types } from 'mongoose';
import { IMember } from '../member/member.interface';
import { IClass } from '../class/class.interface';

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export type IBooking = {
  member: Types.ObjectId | IMember;
  class: Types.ObjectId | IClass;
  bookingDate: Date;
  status: BookingStatus;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IBookingModel = Model<IBooking, {}, {}>;

export type TBookingCreateInput = {
  classId: string;
};

export type TBookingUpdateInput = Partial<
  Omit<IBooking, '_id' | 'createdAt' | 'updatedAt' | 'member' | 'class'>
> & {
  memberId?: string;
  classId?: string;
};

// Query type for searching bookings
export type TBookingQuery = {
  memberId?: string;
  classId?: string;
  status?: BookingStatus;
  date?: string;
  search?: string;
};
