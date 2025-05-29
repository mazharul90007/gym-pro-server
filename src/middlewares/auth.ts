import { Request, Response, NextFunction } from 'express';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { TJWTDecodedPayload } from '../app/modules/auth/auth.interface';
import { UserRole } from '../app/modules/member/member.interface';
import config from '../app/config';

declare global {
  namespace Express {
    interface Request {
      user?: TJWTDecodedPayload;
    }
  }
}

const auth =
  (...requiredRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'Unauthorized access: No token provided.',
        );
      }

      let verifiedUser: TJWTDecodedPayload;
      try {
        verifiedUser = jwt.verify(
          token,
          config.jwt.secret as string,
        ) as TJWTDecodedPayload;
      } catch (_error) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Invalid or Expired Token!');
      }

      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'Unauthorized access: You do not have permission to perform this action.',
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
