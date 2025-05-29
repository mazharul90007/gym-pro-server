import { Schema, model, Query } from 'mongoose';
import { IClass, IClassModel } from './class.interface';
import { Member } from '../member/member.model';
import ApiError from '../../../errors/ApiError';

const ClassSchema = new Schema<IClass, IClassModel>(
  {
    classId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    trainer: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      validate: {
        validator: function (v: number) {
          return v === 120;
        },
        message: (props) =>
          `${props.value} is not a valid class duration! Must be 120 minutes.`,
      },
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,

      default: 10,
      validate: {
        validator: function (v: number) {
          return v <= 10;
        },
        message: 'Maximum capacity cannot exceed 10 trainees.',
      },
    },
    currentBookings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    scheduledTime: { type: Date, required: true },
    location: { type: String, required: true },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// --- SCHEMA MIDDLEWARE (HOOKS) ---

ClassSchema.pre('validate', async function (next) {
  const classToSave = this;

  if (classToSave.isModified('trainer') && classToSave.trainer) {
    const trainerMember = await Member.findById(classToSave.trainer);
    if (!trainerMember || trainerMember.role !== 'trainer') {
      throw new ApiError(400, 'Invalid trainer ID or member is not a trainer.');
    }
  }

  next();
});

ClassSchema.pre('save', function (next) {
  if (this.currentBookings > this.maxCapacity) {
    throw new ApiError(400, 'Current bookings cannot exceed maximum capacity.');
  }
  next();
});

ClassSchema.pre('find', function (this: Query<IClass[], IClass>, next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

ClassSchema.pre('findOne', function (this: Query<IClass | null, IClass>, next) {
  this.findOne({ isDeleted: { $ne: true } });
  next();
});

ClassSchema.pre('findOneAndUpdate', function (this: Query<any, IClass>, next) {
  this.setQuery({ ...this.getQuery(), isDeleted: { $ne: true } });
  next();
});

ClassSchema.statics.isClassAvailable = async function (
  classId: string,
): Promise<boolean> {
  const classDoc = await this.findById(classId);
  return classDoc
    ? classDoc.isAvailable &&
        !classDoc.isDeleted &&
        classDoc.currentBookings < classDoc.maxCapacity
    : false;
};

export const Class = model<IClass, IClassModel>('Class', ClassSchema);
