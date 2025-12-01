import { Request, Response } from 'express';
import mongoose from 'mongoose'; // <-- Đảm bảo mongoose được import
import { UserModel, IUser } from '../models/User.model';
import { TeacherModel, ITeacher } from '../models/Teacher.model';
import { ITeacherPosition } from '../models/TeacherPosition.model';
import { generateUniqueTeacherCode, formatTeacherResponse } from '../utils/helper';

// --- GET /teachers (Phân trang) ---
export const getTeachers = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
        // Giữ lại { } để hiển thị dữ liệu mẫu (có isDeleted: true)
        const totalItems = await TeacherModel.countDocuments({}); 

        const teachersData = await TeacherModel.find({}) 
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate<{ userId: IUser }>('userId')
            .populate<{ teacherPositionsId: ITeacherPosition[] }>('teacherPositionsId');
        
        const formattedTeachers = teachersData
            .map(t => formatTeacherResponse(t as unknown as ITeacher & { userId: IUser, teacherPositionsId: ITeacherPosition[] }))
            .filter(t => t !== null); 
            
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách giáo viên thành công',
            data: formattedTeachers,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
            }
        });

    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách giáo viên' });
    }
};

// --- POST /teachers (Tạo giáo viên với Transaction) ---
export const createTeacher = async (req: Request, res: Response) => {
    const { email, fullName, phoneNumber, address, dob, identityCard, jobPositionId, degrees, isActive } = req.body;
    
    if (!email || !fullName) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin Email và Họ tên.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingUser = await UserModel.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(409).json({ success: false, message: 'Email đã tồn tại.' });
        }

        // 1. Tạo User mới
        const newUser = await UserModel.create([{
            email,
            name: fullName,
            phoneNumber: phoneNumber || undefined,
            address: address || undefined,
            identity: identityCard || undefined,
            dob: dob ? new Date(dob) : undefined,
            role: 'TEACHER',
        }], { session });

        // 2. Tạo Teacher mới
        const newTeacherCode = await generateUniqueTeacherCode();
        
        const degreesForMongo = degrees 
            ? degrees
                .filter((d: any) => d.degree && d.school && d.major && d.year) 
                .map((d: any) => ({
                    type: d.degree,
                    school: d.school,
                    major: d.major,
                    year: parseInt(d.year),
                    isGraduated: d.status && d.status.trim().toLowerCase() === 'hoàn thành',                })) 
            : [];

        const positionIds = Array.isArray(jobPositionId) 
                ? jobPositionId.map((id: string) => new mongoose.Types.ObjectId(id)) 
                : (jobPositionId ? [new mongoose.Types.ObjectId(jobPositionId)] : []);
                
        const newTeacher = await TeacherModel.create([{
            code: newTeacherCode,
            userId: newUser[0]._id,
            teacherPositionsId: positionIds,
            degrees: degreesForMongo,
            isActive: isActive !== undefined ? isActive : true,
        }], { session });
        
        await session.commitTransaction();

        // Lấy lại dữ liệu đã populate
        const createdTeacher = await TeacherModel.findById(newTeacher[0]._id)
            .populate<{ userId: IUser }>('userId')
            .populate<{ teacherPositionsId: ITeacherPosition[] }>('teacherPositionsId');

        if (!createdTeacher) {
             return res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin giáo viên vừa tạo.' });
        }

        const formattedResponse = formatTeacherResponse(createdTeacher as unknown as ITeacher & { userId: IUser, teacherPositionsId: ITeacherPosition[] });
        
        // Kiểm tra lỗi format
        if (!formattedResponse) {
             return res.status(500).json({ success: false, message: 'Lỗi định dạng dữ liệu giáo viên.' });
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Tạo giáo viên thành công', 
            data: formattedResponse
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.error('Error creating teacher:', error);
        
        // Xử lý lỗi trùng lặp (Mã giáo viên/Email)
        if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
            return res.status(409).json({ success: false, message: 'Lỗi trùng lặp dữ liệu (Mã Giáo viên/Email).' });
        }
        
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ: ' + error.message });
        }

        res.status(500).json({ success: false, message: 'Lỗi server khi tạo giáo viên.' });
    } finally {
        session.endSession();
    }
};