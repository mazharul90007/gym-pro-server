import { Request, Response } from 'express';
import { MemberService } from './member.service';
import {
  TMemberCreateInput,
  TMemberUpdateInput,
  TMemberQuery,
} from './member.interface';
import { catchAsync } from '../../../utils/catchAsync';
import ApiError from '../../../errors/ApiError';

const createMember = catchAsync(async (req: Request, res: Response) => {
  const memberData: TMemberCreateInput = req.body;
  const result = await MemberService.createMemberInDB(memberData);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Member created successfully',
    data: result,
  });
});

const getAllMembers = catchAsync(async (req: Request, res: Response) => {
  const query: TMemberQuery = req.query;
  const result = await MemberService.getAllMembersFromDB(query);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'All members retrieved successfully',
    data: result,
  });
});

const getSingleMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MemberService.getSingleMemberFromDB(id);
  if (!result) {
    throw new ApiError(404, 'Member not found!');
  }
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Member data retrieved successfully',
    data: result,
  });
});

const updateMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: TMemberUpdateInput = req.body;
  const result = await MemberService.updateMemberInDB(id, updateData);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Member updated successfully',
    data: result,
  });
});

const deleteMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MemberService.deleteMemberFromDB(id);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Member deleted successfully (soft delete)',
    data: result,
  });
});

export const MemberControllers = {
  createMember,
  getAllMembers,
  getSingleMember,
  updateMember,
  deleteMember,
};
