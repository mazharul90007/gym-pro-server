import {
  TLoginPayload,
  TLoginResponse,
  TJWTDecodedPayload,
} from './auth.interface';
import {
  TMemberCreateInput,
  IMember,
  USER_ROLE,
} from '../member/member.interface';
import ApiError from '../../../errors/ApiError';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../../config';
import { Member } from '../member/member.model';

// Existing loginUser function
const loginUser = async (payload: TLoginPayload): Promise<TLoginResponse> => {
  const { email, password } = payload;

  const member = await Member.isUserExist(email);
  if (!member || member.isDeleted) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User not found or account is inactive/deleted!',
    );
  }
  if (!member.isActive) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User account is inactive. Please contact support.',
    );
  }

  if (
    !member.password ||
    !(await Member.isPasswordMatched(password, member.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials!');
  }

  const jwtPayload: TJWTDecodedPayload = {
    memberId: member._id.toString(), // member._id will be ObjectId, convert to string
    email: member.email,
    role: member.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt.secret as string, {
    expiresIn: config.jwt.access_token_expires_in,
  });

  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt.refresh_secret as string,
    {
      expiresIn: config.jwt.refresh_token_expires_in,
    },
  );

  return {
    accessToken,
    refreshToken,
  };
};

const createUser = async (
  payload: TMemberCreateInput,
): Promise<Partial<IMember>> => {
  const roleToUse = payload.role || USER_ROLE.TRAINEE;
  const userDataWithDefinedRole = { ...payload, role: roleToUse };
  const existingMember = await Member.isUserExist(payload.email);
  if (existingMember && !existingMember.isDeleted) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'User with this email already exists!',
    );
  }

  const newMember = await Member.create(userDataWithDefinedRole);
  const { password, ...result } = newMember.toObject();

  return result;
};

export const AuthService = {
  loginUser,
  createUser,
};
