import { Member } from '../member/member.model';
import {
  TLoginPayload,
  TLoginResponse,
  TJWTDecodedPayload,
} from './auth.interface';
import ApiError from '../../../errors/ApiError';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../../config';

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
    memberId: member._id.toString(),
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

export const AuthService = {
  loginUser,
};
