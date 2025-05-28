import { Schema, model } from 'mongoose';
import { IMember, IMemberModel, UserRole } from './member.interface';
import config from '../../config';
import bcrypt from 'bcrypt';

const MemberSchema = new Schema<IMember, IMemberModel>(
  {
    memberId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    addressStreet: { type: String, required: true },
    addressCity: { type: String, required: true },
    addressState: { type: String, required: true },
    addressZipCode: { type: String, required: true },
    addressCountry: { type: String, required: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    dateOfBirth: { type: Date },
    membershipType: { type: String, default: 'bronze' },
    membershipStartDate: { type: Date, default: Date.now },
    membershipEndDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.trainee,
      required: true,
    },
    profilePicture: { type: String },
    lastLogin: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

MemberSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password as string,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

MemberSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

MemberSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: { $ne: true } });
  next();
});

MemberSchema.pre('findOneAndUpdate', function (next) {
  // 'this' refers to the query being executed
  this.setQuery({ ...this.getQuery(), isDeleted: { $ne: true } });
  next();
});

export const Member = model<IMember, IMemberModel>('Member', MemberSchema);
