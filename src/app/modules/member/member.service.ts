import {
  IMember,
  TMemberCreateInput,
  TMemberQuery,
  TMemberUpdateInput,
} from './member.interface';
import ApiError from '../../../errors/ApiError';
import { Member } from './member.model';

const createMemberInDB = async (
  payload: TMemberCreateInput,
): Promise<IMember> => {
  const existingMember = await Member.findOne({
    email: payload.email,
    isDeleted: false,
  });
  if (existingMember) {
    throw new ApiError(400, 'Member with this email already exists!');
  }
  const result = await Member.create(payload);
  return result;
};

const getAllMembersFromDB = async (query: TMemberQuery): Promise<IMember[]> => {
  const { role, isActive, search } = query;
  const filter: any = {};

  if (role) {
    filter.role = role;
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { memberId: { $regex: search, $options: 'i' } },
    ];
  }

  const result = await Member.find(filter);
  return result;
};

const getSingleMemberFromDB = async (id: string): Promise<IMember | null> => {
  const result = await Member.findById(id);
  return result;
};

const updateMemberInDB = async (
  id: string,
  payload: TMemberUpdateInput,
): Promise<IMember | null> => {
  const result = await Member.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(404, 'Member not found!');
  }
  return result;
};

const deleteMemberFromDB = async (id: string): Promise<IMember | null> => {
  const result = await Member.findByIdAndUpdate(
    id,
    { isDeleted: true, isActive: false },
    { new: true },
  );
  if (!result) {
    throw new ApiError(404, 'Member not found for deletion!');
  }
  return result;
};

export const MemberService = {
  createMemberInDB,
  getAllMembersFromDB,
  getSingleMemberFromDB,
  updateMemberInDB,
  deleteMemberFromDB,
};
