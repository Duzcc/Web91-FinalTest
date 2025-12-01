export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Education {
  id: string; // ID tạm cho React key
  degree: string; // Cử nhân, Thạc sĩ, Tiến sĩ, Cao đẳng
  school: string;
  major: string;
  status: string; // Hoàn thành, Đang học, Bảo lưu
  year: string; // Năm tốt nghiệp (string để dễ nhập liệu)
}

export interface JobPosition {
  id: string;
  code: string;
  name: string;
  description: string;
  status: Status;
}

export interface Teacher {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
  identityCard?: string;
  status: Status;
  avatarUrl?: string;

  jobPositions: { id: string, name: string }[];
  highestDegree: string;
  highestSchool: string;

  jobPositionId?: string;
  educations: Education[];
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TEACHERS = 'TEACHERS',
  JOB_POSITIONS = 'JOB_POSITIONS',
}