import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User.model'; 

// Định nghĩa Interface cho Degrees (Nhúng)
export interface IDegree {
  type: string;
  school: string;
  major: string;
  year: number;
  isGraduated: boolean;
}

// Định nghĩa Interface cho Teacher
export interface ITeacher extends Document {
  code: string;
  userId: mongoose.Types.ObjectId;
  teacherPositionsId: mongoose.Types.ObjectId[];
  degrees: IDegree[];
  isActive: boolean;
  isDeleted: boolean;
  startDate: Date;
}

// --- Schemas ---

const DegreeSchema: Schema = new Schema<IDegree>({
  type: { type: String, required: true },
  school: { type: String, required: true },
  major: { type: String, required: true },
  year: { type: Number, required: true },
  isGraduated: { type: Boolean, required: true },
}, { _id: false });

const TeacherSchema: Schema = new Schema<ITeacher>({
  code: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherPositionsId: [{ type: Schema.Types.ObjectId, ref: 'TeacherPosition' }],
  degrees: [DegreeSchema],
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  startDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Định nghĩa Model
export const TeacherModel: Model<ITeacher> = mongoose.model<ITeacher>('Teacher', TeacherSchema);