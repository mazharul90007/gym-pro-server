import { Model, Types } from 'mongoose';
import { IMember } from '../member/member.interface';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type IClass = {
  classId: string;
  name: string;
  description?: string;
  trainer: Types.ObjectId | IMember;
  durationMinutes: number;
  maxCapacity: number;
  currentBookings: number;
  scheduledTime: Date;
  location: string;
  difficultyLevel: DifficultyLevel;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IClassModel = Model<IClass, {}, {}>;

export type TClassCreateInput = Omit<
  IClass,
  | '_id'
  | 'currentBookings'
  | 'isAvailable'
  | 'isDeleted'
  | 'createdAt'
  | 'updatedAt'
  | 'trainer'
> & {
  trainerId: string;
};

export type TClassUpdateInput = Partial<Omit<IClass, 'trainer'>> & {
  trainerId?: string;
};

export type TClassQuery = {
  trainerId?: string;
  location?: string;
  difficultyLevel?: DifficultyLevel;
  date?: string;
  isAvailable?: string;
  search?: string;
};
