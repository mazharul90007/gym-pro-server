// src/modules/classes/class.service.ts
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
import { Member } from '../member/member.model';
import config from '../../config';

const createClassInDB = async (payload: TClassCreateInput): Promise<IClass> => {
  const { trainerId, ...classData } = payload;

  const existingClass = await Class.findOne({
    classId: classData.classId,
    isDeleted: false,
  });
  if (existingClass) {
    throw new ApiError(400, 'Class with this ID already exists!');
  }

  const trainer = await Member.findById(trainerId);
  if (!trainer) {
    throw new ApiError(404, 'Trainer not found!');
  }

  if (trainer.role === 'admin') {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const createdClassesToday = await Class.countDocuments({
      trainer: trainerId,
      scheduledTime: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
      isDeleted: false,
    });

    if (createdClassesToday >= config.admin_max_schedules_per_day) {
      throw new ApiError(
        400,
        `Admin cannot create more than ${config.admin_max_schedules_per_day} schedules per day.`,
      );
    }
  }

  const classToCreate = {
    ...classData,
    trainer: new Types.ObjectId(trainerId), // This should now be fine
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
      throw new ApiError(400, 'Invalid date format for query. Use YYYY-MM-DD.');
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
    if (!trainerMember || trainerMember.role !== 'trainer') {
      throw new ApiError(
        400,
        'Invalid new trainer ID or member is not a trainer.',
      );
    }
    updateFields.trainer = new Types.ObjectId(trainerId);
  }

  if (payload.currentBookings !== undefined) {
    const existingClass = await Class.findById(id);
    if (!existingClass) {
      throw new ApiError(404, 'Class not found!');
    }
    const newCapacity =
      payload.maxCapacity !== undefined
        ? payload.maxCapacity
        : existingClass.maxCapacity;
    if (payload.currentBookings > newCapacity) {
      throw new ApiError(
        400,
        'Cannot set current bookings greater than max capacity!',
      );
    }
  }

  const result = await Class.findByIdAndUpdate(id, updateFields, { new: true });
  if (!result) {
    throw new ApiError(404, 'Class not found for update!');
  }

  const populatedResult = await Class.findById(result._id).populate('trainer');
  return populatedResult;
};

const deleteClassFromDB = async (id: string): Promise<IClass | null> => {
  const existingClass = await Class.findById(id);
  if (!existingClass) {
    throw new ApiError(404, 'Class not found for deletion!');
  }

  if (existingClass.currentBookings > 0) {
    throw new ApiError(
      400,
      'Cannot delete class with active bookings. Cancel all bookings first.',
    );
  }

  const result = await Class.findByIdAndUpdate(
    id,
    { isDeleted: true, isAvailable: false },
    { new: true },
  );

  if (!result) {
    throw new ApiError(404, 'Class not found for deletion!');
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
