import mongoose, { Schema, Document, Model } from 'mongoose';

// Định nghĩa Interface cho Teacher Position
export interface ITeacherPosition extends Document {
  code: string; // Duy nhất
  name: string;
  des: string;
  isActive: boolean;
  isDeleted: boolean;
}

// Định nghĩa Schema
const TeacherPositionSchema: Schema = new Schema<ITeacherPosition>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  des: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Định nghĩa Model
export const TeacherPositionModel: Model<ITeacherPosition> = mongoose.model<ITeacherPosition>('TeacherPosition', TeacherPositionSchema);