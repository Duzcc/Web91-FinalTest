import { API_URL, INITIAL_JOB_POSITIONS } from './constants';
import { JobPosition, Teacher, Education, Pagination, Status } from './types';

const fetchData = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const result = await response.json();
  
  if (!response.ok || !result.success) {
    console.error('API Error:', result.message || `API call failed for ${endpoint}`);
    return { success: false, message: result.message || 'Lỗi không xác định' };
  }
  return result;
};


export const fetchTeachers = async (page: number, limit: number): Promise<{ teachers: Teacher[], pagination: Pagination } | { teachers: Teacher[], pagination: null }> => {
  const result = await fetchData(`/teachers?page=${page}&limit=${limit}`);
  
  if (result.success) {
    const formattedTeachers: Teacher[] = result.data.map((t: any) => ({
      ...t,
      educations: t.rawDegrees.map((d: any, index: number) => ({
        id: (t.id || index) + d.type + d.major, 
        degree: d.type,
        school: d.school,
        major: d.major,
        status: d.isGraduated ? 'Hoàn thành' : 'Đang học',
        year: String(d.year),
      })),
      jobPositionIds: t.jobPositionIds,
      jobPositionId: undefined,
    }));

    return {
      teachers: formattedTeachers,
      pagination: result.pagination,
    };
  }
  return { teachers: [], pagination: null };
};

export const createTeacher = async (data: Partial<Teacher>): Promise<{ success: boolean, message: string, teacher?: Teacher }> => {
  
  const degreesForApi = data.educations?.map((edu: Education) => ({
    type: edu.degree,
    school: edu.school,
    major: edu.major,
    status: edu.status,
    year: edu.year,
  }));

  const payload = {
    email: data.email,
    fullName: data.fullName,
    phoneNumber: data.phone,
    address: data.address,
    dob: data.dob,
    identityCard: data.identityCard,
    jobPositionId: data.jobPositionId, 
    degrees: degreesForApi,
    isActive: data.status === Status.ACTIVE,
  };

  const result = await fetchData('/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (result.success) {
     const teacherData = result.data;
     const formattedTeacher: Teacher = {
         id: teacherData.id,
         code: teacherData.code,
         fullName: teacherData.fullName,
         email: teacherData.email,
         phone: teacherData.phone,
         address: teacherData.address,
         identityCard: teacherData.identityCard,
         dob: teacherData.dob,
         status: teacherData.status,
         avatarUrl: teacherData.avatarUrl,
         jobPositions: teacherData.jobPositions,
         highestDegree: teacherData.highestDegree, 
         highestSchool: teacherData.highestSchool, 
         
         rawDegrees: teacherData.rawDegrees,
         jobPositionIds: teacherData.jobPositionIds,
         educations: teacherData.rawDegrees.map((d: any, index: number) => ({
            id: (teacherData.id || index) + d.type + d.major, 
            degree: d.type,
            school: d.school,
            major: d.major,
            status: d.isGraduated ? 'Hoàn thành' : 'Đang học',
            year: String(d.year),
         })),
         jobPositionId: undefined,
     }

    return { success: true, message: result.message, teacher: formattedTeacher };
  }
  return { success: false, message: result.message || 'Lỗi khi tạo giáo viên.' };
};



export const fetchJobPositions = async (): Promise<JobPosition[]> => {
  const result = await fetchData('/teacher-positions');
  if (result.success) {
    return result.data as JobPosition[];
  }
  return INITIAL_JOB_POSITIONS;
};

export const createJobPosition = async (data: Partial<JobPosition>): Promise<{ success: boolean, message: string, jobPosition?: JobPosition }> => {
  const payload = {
    code: data.code,
    name: data.name,
    des: data.description, 
    status: data.status,
  };
  
  const result = await fetchData('/teacher-positions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (result.success) {
    return { success: true, message: result.message, jobPosition: result.data };
  }
  return { success: false, message: result.message || 'Lỗi khi tạo vị trí công tác.' };
};