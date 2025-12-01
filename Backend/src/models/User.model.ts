import mongoose, { Schema, Document, Model } from 'mongoose';

// Định nghĩa Interface cho User
export interface IUser extends Document {
  email: string; // Duy nhất
  name: string;
  phoneNumber?: string;
  address?: string;
  identity?: string;
  dob?: Date;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isDeleted: boolean;
}

// Định nghĩa Schema
const UserSchema: Schema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: String,
  address: String,
  identity: String,
  dob: Date,
  role: { type: String, enum: ['STUDENT', 'TEACHER', 'ADMIN'], required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Định nghĩa Model
export const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);