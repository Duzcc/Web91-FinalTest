import { Request, Response } from 'express';
import { TeacherPositionModel } from '../models/TeacherPosition.model';

// --- GET /teacher-positions ---
export const getTeacherPositions = async (req: Request, res: Response) => {
    try {
        const positions = await TeacherPositionModel.find({}).sort({ name: 1 });

        const formattedPositions = positions.map(p => ({
            id: p._id.toString(),
            code: p.code,
            name: p.name,
            description: p.des,
            status: p.isActive ? 'ACTIVE' : 'INACTIVE',
        }));

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách vị trí công tác thành công',
            data: formattedPositions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy vị trí công tác' });
    }
};

// --- POST /teacher-positions ---
export const createTeacherPosition = async (req: Request, res: Response) => {
    const { code, name, description, status } = req.body;

    if (!code || !name) {
        return res.status(400).json({ success: false, message: 'Thiếu Mã và Tên vị trí.' });
    }

    try {
        const existingPosition = await TeacherPositionModel.findOne({ code });
        if (existingPosition) {
            return res.status(409).json({ success: false, message: `Mã vị trí "${code}" đã tồn tại.` });
        }
        
        const newPosition = await TeacherPositionModel.create({
            code,
            name,
            des: description || '',
            isActive: status === 'ACTIVE',
        });

        res.status(201).json({ 
            success: true, 
            message: 'Tạo vị trí công tác thành công', 
            data: {
                id: newPosition._id.toString(),
                code: newPosition.code,
                name: newPosition.name,
                description: newPosition.des,
                status: newPosition.isActive ? 'ACTIVE' : 'INACTIVE',
            }
        });
    } catch (error) {
        console.error('Error creating teacher position:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo vị trí công tác' });
    }
};