import {
  TClassCreateInput,
  TClassUpdateInput,
  TClassQuery,
  IClass,
} from './class.interface';

import { startOfDay, endOfDay } from 'date-fns';

import { Class } from './class.model';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { Member } from '../member/member.model';
import config from '../../config';
import { USER_ROLE } from '../member/member.interface';

const createClassInDB = async (payload: TClassCreateInput): Promise<IClass> => {
  const { trainerId, ...classData } = payload;

  const existingClass = await Class.findOne({
    classId: classData.classId,
    isDeleted: false,
  });
  if (existingClass) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Class with this ID already exists!',
    );
  }

  const classScheduledDate = new Date(payload.scheduledTime);
  const startOfClassDay = startOfDay(classScheduledDate);
  const endOfClassDay = endOfDay(classScheduledDate);

  const classesCountOnScheduledDay = await Class.countDocuments({
    scheduledTime: {
      $gte: startOfClassDay,
      $lte: endOfClassDay,
    },
    isDeleted: false,
  });

  if (classesCountOnScheduledDay >= config.admin_max_schedules_per_day) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot schedule more than ${config.admin_max_schedules_per_day} classes on ${classScheduledDate.toDateString()}. Limit reached.`,
    );
  }

  const trainer = await Member.findById(trainerId);

  if (!trainer || trainer.isDeleted || trainer.role !== USER_ROLE.TRAINER) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Trainer not found or is not a valid trainer role!',
    );
  }

  const classToCreate = {
    ...classData,
    trainer: new Types.ObjectId(trainerId),
    currentBookings: 0,
    isAvailable: true,
  };

  const result = await Class.create(classToCreate);
  return result;
};

const getAllClassesFromDB = async (query: TClassQuery): Promise<IClass[]> => {
  const { trainerId, location, difficultyLevel, date, isAvailable, search } =
    query;
  const filter: any = {};

  if (trainerId) {
    filter.trainer = new Types.ObjectId(trainerId);
  }
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }
  if (difficultyLevel) {
    filter.difficultyLevel = difficultyLevel;
  }

  if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable === 'true';
  }
  if (date) {
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid date format for query. Use YYYY-MM-DD.',
      );
    }
    filter.scheduledTime = {
      $gte: startOfDay(queryDate),
      $lte: endOfDay(queryDate),
    };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { classId: { $regex: search, $options: 'i' } },
    ];
  }

  filter.isDeleted = { $ne: true };

  const result = await Class.find(filter).populate('trainer');
  return result;
};

const getSingleClassFromDB = async (id: string): Promise<IClass | null> => {
  const result = await Class.findById(id).populate('trainer');
  return result;
};

const updateClassInDB = async (
  id: string,
  payload: TClassUpdateInput,
): Promise<IClass | null> => {
  const { trainerId, ...updateData } = payload;

  const updateFields: Partial<IClass> = { ...updateData };

  if (trainerId) {
    const trainerMember = await Member.findById(trainerId);
    if (
      !trainerMember ||
      trainerMember.isDeleted ||
      trainerMember.role !== USER_ROLE.TRAINER
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid new trainer ID or member is not a trainer.',
      );
    }
    updateFields.trainer = new Types.ObjectId(trainerId);
  }

  if (
    payload.currentBookings !== undefined ||
    payload.maxCapacity !== undefined
  ) {
    const existingClass = await Class.findById(id);
    if (!existingClass) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Class not found!');
    }

    const newMaxCapacity =
      payload.maxCapacity !== undefined
        ? payload.maxCapacity
        : existingClass.maxCapacity;

    const newCurrentBookings =
      payload.currentBookings !== undefined
        ? payload.currentBookings
        : existingClass.currentBookings;

    if (newCurrentBookings > newMaxCapacity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot set current bookings greater than max capacity!',
      );
    }
  }

  const result = await Class.findByIdAndUpdate(id, updateFields, { new: true });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Class not found for update!');
  }

  const populatedResult = await Class.findById(result._id).populate('trainer');
  return populatedResult;
};

const deleteClassFromDB = async (id: string): Promise<IClass | null> => {
  const existingClass = await Class.findById(id);
  if (!existingClass) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Class not found for deletion!');
  }

  if (existingClass.currentBookings > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete class with active bookings. All bookings must be cancelled first.',
    );
  }

  const result = await Class.findByIdAndUpdate(
    id,
    { isDeleted: true, isAvailable: false },
    { new: true },
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Class not found for deletion!');
  }

  return result;
};

export const ClassService = {
  createClassInDB,
  getAllClassesFromDB,
  getSingleClassFromDB,
  updateClassInDB,
  deleteClassFromDB,
};
