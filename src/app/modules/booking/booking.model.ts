// src/app/modules/booking/booking.model.ts
import { Schema, model, Query } from 'mongoose';
import { IBooking, IBookingModel, BOOKING_STATUS } from './booking.interface';

const BookingSchema = new Schema<IBooking, IBookingModel>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// --- SCHEMA MIDDLEWARE (HOOKS) ---
BookingSchema.pre('find', function (this: Query<IBooking[], IBooking>, next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

BookingSchema.pre(
  'findOne',
  function (this: Query<IBooking | null, IBooking>, next) {
    this.findOne({ isDeleted: { $ne: true } });
    next();
  },
);

BookingSchema.pre(
  'findOneAndUpdate',
  function (this: Query<any, IBooking>, next) {
    this.setQuery({ ...this.getQuery(), isDeleted: { $ne: true } });
    next();
  },
);

BookingSchema.index({ member: 1, class: 1 }, { unique: true });

export const Booking = model<IBooking, IBookingModel>('Booking', BookingSchema);
