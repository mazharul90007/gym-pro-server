import { Model } from 'mongoose';
export const USER_ROLE = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  TRAINEE: 'trainee',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type IMember = {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressCountry: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  membershipType: string;
  membershipStartDate: Date;
  membershipEndDate: Date;
  isActive: boolean;
  role: UserRole;
  profilePicture?: string;
  lastLogin?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IMemberModel = Model<
  IMember,
  {},
  {
    isUserExist(email: string): Promise<IMember | null>;
    isPasswordMatched(
      givenPassword: string,
      savedPassword: string,
    ): Promise<boolean>;
  }
>;

export type TMemberCreateInput = Omit<
  IMember,
  '_id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'lastLogin' | 'isActive'
> & { password: string };

export type TMemberUpdateInput = Partial<TMemberCreateInput>;

export type TMemberQuery = {
  role?: UserRole;
  isActive?: string;
  search?: string;
};
