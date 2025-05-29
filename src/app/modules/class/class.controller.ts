import { Request, Response } from 'express';
import { ClassService } from './class.service';

import {
  TClassCreateInput,
  TClassUpdateInput,
  TClassQuery,
} from './class.interface';
import { catchAsync } from '../../../utils/catchAsync';
import ApiError from '../../../errors/ApiError';

const createClass = catchAsync(async (req: Request, res: Response) => {
  const classData: TClassCreateInput = req.body;
  const result = await ClassService.createClassInDB(classData);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Class created successfully',
    data: result,
  });
});

const getAllClasses = catchAsync(async (req: Request, res: Response) => {
  const query: TClassQuery = req.query;
  const result = await ClassService.getAllClassesFromDB(query);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'All classes retrieved successfully',
    data: result,
  });
});

const getSingleClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ClassService.getSingleClassFromDB(id);
  if (!result) {
    throw new ApiError(404, 'Class not found!');
  }
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Class data retrieved successfully',
    data: result,
  });
});

const updateClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: TClassUpdateInput = req.body;
  const result = await ClassService.updateClassInDB(id, updateData);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Class updated successfully',
    data: result,
  });
});

const deleteClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ClassService.deleteClassFromDB(id);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Class deleted successfully (soft delete)',
    data: result,
  });
});

export const ClassControllers = {
  createClass,
  getAllClasses,
  getSingleClass,
  updateClass,
  deleteClass,
};
