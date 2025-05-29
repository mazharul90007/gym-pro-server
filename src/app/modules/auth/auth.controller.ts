import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import { AuthService } from './auth.service';
import { TLoginPayload } from './auth.interface';
import { TMemberCreateInput } from '../member/member.interface';
import httpStatus from 'http-status';
import config from '../../config';

// Controller for user login
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const loginData: TLoginPayload = req.body;
  const result = await AuthService.loginUser(loginData);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.node_env === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  });

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: 'User logged in successfully!',
    data: { accessToken: result.accessToken },
  });
});

// Controller for user signup (CREATING A NEW USER)
const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData: TMemberCreateInput = req.body;

  const result = await AuthService.createUser(userData);

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User signed up successfully!',
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  createUser,
};
