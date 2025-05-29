import { UserRole } from '../member/member.interface';

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type TJWTDecodedPayload = {
  memberId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};
