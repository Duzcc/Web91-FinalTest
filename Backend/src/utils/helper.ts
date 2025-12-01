import mongoose from 'mongoose';
import { TeacherModel, ITeacher, IDegree } from '../models/Teacher.model';
import { IUser } from '../models/User.model';
import { ITeacherPosition } from '../models/TeacherPosition.model';

export const generateUniqueTeacherCode = async (): Promise<string> => {
    let code: string;
    let isUnique = false;
    do {
        code = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 chữ số
        const existingTeacher = await TeacherModel.findOne({ code });
        if (!existingTeacher) {
            isUnique = true;
        }
    } while (!isUnique);
    return code;
};


const normalizeDegreeType = (type: string): string => {
    // Chuyển sang chữ thường để kiểm tra
    const lowerType = type.toLowerCase();
    
    switch (lowerType) {
        case 'tiến sĩ':
        case 'tiên sĩ': 
        case 'doctorate':
            return 'Tiến sĩ';
        
        case 'thạc sĩ':
        case 'thac si':
        case 'master':
            return 'Thạc sĩ';
            
        case 'cử nhân':
        case 'cu nhan':
        case 'bachelor':
            return 'Cử nhân';
            
        case 'cao đẳng':
        case 'cao dang':
            return 'Cao đẳng';
            
        default:
            return 'N/A';
    }
};

export const getHighestDegreeInfo = (degrees: IDegree[]): { highestDegree: string, highestSchool: string } => {
    if (!degrees || degrees.length === 0) return { highestDegree: 'N/A', highestSchool: 'N/A' };
    
    const degreeOrder: Map<string, number> = new Map([
        ['Tiến sĩ', 4],
        ['Thạc sĩ', 3],
        ['Cử nhân', 2], 
        ['Cao đẳng', 1],
        ['N/A', 0] 
    ]);
    
    let highest: IDegree | null = null;
    let maxOrder = 0;

    for (const degree of degrees) {
        const normalizedType = normalizeDegreeType(degree.type); 
        
        const order = degree.isGraduated ? (degreeOrder.get(normalizedType) || 0) : 0; 
        
        if (order > maxOrder) {
            maxOrder = order;
            highest = degree;
        }
    }

    if (!highest) return { highestDegree: 'N/A', highestSchool: 'N/A' };

    return {
        highestDegree: normalizeDegreeType(highest.type),
        highestSchool: highest.school
    };
};

export const formatTeacherResponse = (teacherDoc: ITeacher & { userId: IUser, teacherPositionsId: ITeacherPosition[] }): any => {
    const user = teacherDoc.userId;
    const positions = teacherDoc.teacherPositionsId ? teacherDoc.teacherPositionsId.filter(p => p) : [];
    const graduatedDegrees = teacherDoc.degrees.filter(d => d.isGraduated);

    const { highestDegree, highestSchool } = getHighestDegreeInfo(graduatedDegrees);
    
    if (!user || typeof user.name === 'undefined') {
        return null; 
    }
    
    return {
        id: teacherDoc._id.toString(),
        code: teacherDoc.code,
        fullName: user.name,
        email: user.email,
        phone: user.phoneNumber,
        address: user.address,
        identityCard: user.identity,
        dob: user.dob ? new Date(user.dob).toISOString().substring(0, 10) : undefined,
        status: teacherDoc.isActive ? 'ACTIVE' : 'INACTIVE',
        avatarUrl: `https://ui-avatars.com/api/?name=${user.name}&background=random`,
        
        jobPositions: positions.map(p => ({ id: (p as any)._id.toString(), name: (p as any).name })),
        
        highestDegree,
        highestSchool,
        
        rawDegrees: teacherDoc.degrees,
        jobPositionIds: positions.length > 0 ? positions.map(p => (p as any)._id.toString()) : [],
    };
};