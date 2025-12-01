import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { Teacher, Status, Education, JobPosition } from '../types';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Teacher>) => void;
  initialData?: Teacher | null;
  jobPositions: JobPosition[]; 
}

const TeacherModal: React.FC<TeacherModalProps> = ({ isOpen, onClose, onSave, initialData, jobPositions }) => {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    educations: [],
    fullName: '', email: '', phone: '', address: '', dob: '', code: '', identityCard: ''
  });

  const [activeTab, setActiveTab] = useState<'INFO' | 'JOB' | 'EDU'>('INFO');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        educations: initialData.educations || [], 
      });
    } else {
      setFormData({
        status: Status.ACTIVE,
        educations: [],
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dob: '',
        code: `TE${Math.floor(1000 + Math.random() * 9000)}`, // Mã tạm thời
        jobPositionId: jobPositions.length > 0 ? jobPositions[0].id : undefined,
        identityCard: '',
      });
    }
  }, [initialData, isOpen, jobPositions]);

  if (!isOpen) return null;

  const handleEducationAdd = () => {
    const newEdu: Education = {
      id: Math.random().toString(36).substr(2, 9),
      degree: 'Cử nhân',
      school: '',
      major: '',
      status: 'Hoàn thành',
      year: new Date().getFullYear().toString()
    };
    setFormData(prev => ({ ...prev, educations: [...(prev.educations || []), newEdu] }));
  };

  const handleEducationRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations?.filter(e => e.id !== id)
    }));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations?.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const getHighestDegree = (): string => {
      const degrees = formData.educations || [];
      const degreeOrder = { 'Tiến sĩ': 4, 'Thạc sĩ': 3, 'Cử nhân': 2, 'Cao đẳng': 1 };
      let highest = 'Chưa rõ';
      let maxOrder = 0;
      
      degrees.forEach(e => {
          const order = degreeOrder[e.degree as keyof typeof degreeOrder] || 0;
          if (order > maxOrder) {
              maxOrder = order;
              highest = e.degree;
          }
      });

      return highest;
  }

  const getCurrentJobName = (): string => {
      return jobPositions.find(j => j.id === formData.jobPositionId)?.name || 'Chưa phân công';
  }
  
  const handleSave = () => {
      if (!formData.fullName || !formData.email || !formData.dob) {
           alert('Vui lòng điền đủ Họ tên, Email và Ngày sinh.'); 
           return;
      }
      onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? 'Cập nhật thông tin giáo viên' : 'Tạo thông tin giáo viên'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body - Split View */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Avatar & Basic Info Summary */}
          <div className="w-1/4 bg-gray-50 p-6 border-r flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center mb-4 relative overflow-hidden group border-2 border-indigo-200">
                {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=random`)} />
                ) : (
                    <img src={`https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="text-white" />
                </div>
            </div>
            <button className="text-sm text-indigo-600 font-medium mb-6">Chọn ảnh</button>
            
            <h3 className="font-bold text-gray-800 text-center text-lg">{formData.fullName || 'Tên giáo viên'}</h3>
            <p className="text-gray-500 text-sm text-center mb-4">{formData.code}</p>

            <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${formData.status === Status.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {formData.status === Status.ACTIVE ? 'Hoạt động' : 'Ngừng'}
                    </span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Vị trí:</span>
                    <span className="text-gray-700 font-medium text-right">{getCurrentJobName()}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trình độ:</span>
                    <span className="text-gray-700 font-medium">{getHighestDegree()}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ngày sinh:</span>
                    <span className="text-gray-700">{formData.dob || '--/--/----'}</span>
                </div>
            </div>
          </div>

          {/* Right: Form Fields */}
          <div className="flex-1 flex flex-col overflow-hidden">
             {/* Tabs */}
             <div className="flex border-b px-6 pt-4">
                <button 
                    onClick={() => setActiveTab('INFO')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 mr-4 transition-colors ${activeTab === 'INFO' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Thông tin cá nhân
                </button>
                <button 
                    onClick={() => setActiveTab('JOB')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 mr-4 transition-colors ${activeTab === 'JOB' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Thông tin công tác
                </button>
                 <button 
                    onClick={() => setActiveTab('EDU')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 mr-4 transition-colors ${activeTab === 'EDU' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Học vị
                </button>
             </div>

             <div className="p-6 overflow-y-auto flex-1">
                {activeTab === 'INFO' && (
                    <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-2">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2">Thông tin cá nhân</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.fullName || ''}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                placeholder="VD: Nguyễn Văn A"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={formData.dob || ''}
                                    onChange={e => setFormData({...formData, dob: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input 
                                type="text" 
                                value={formData.phone || ''}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="Nhập số điện thoại"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                            <input 
                                type="email" 
                                value={formData.email || ''}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="example@school.edu.vn"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.identityCard || ''}
                                onChange={e => setFormData({...formData, identityCard: e.target.value})}
                                placeholder="Nhập số CCCD"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.address || ''}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                placeholder="Địa chỉ thường trú"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'JOB' && (
                    <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-2">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-2">Thông tin công tác</h3>
                        </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí công tác <span className="text-red-500">*</span></label>
                            <select 
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={formData.jobPositionId || ''}
                                onChange={e => setFormData({...formData, jobPositionId: e.target.value})}
                            >
                                <option value="">Chọn vị trí công tác</option>
                                {jobPositions.map(job => (
                                    <option key={job.id} value={job.id}>{job.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bộ môn (Chủ nhiệm/Giảng dạy)</label>
                            <input 
                                type="text" 
                                value={formData.subject || ''}
                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                placeholder="VD: Toán học, Lịch sử, N/A"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái công tác <span className="text-red-500">*</span></label>
                            <div className="flex items-center space-x-0 border border-gray-300 rounded-md w-fit overflow-hidden">
                               <button
                                 type="button"
                                 onClick={() => setFormData({...formData, status: Status.ACTIVE})}
                                 className={`px-4 py-2 text-sm font-medium ${formData.status === Status.ACTIVE ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                               >
                                 Đang công tác
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setFormData({...formData, status: Status.INACTIVE})}
                                 className={`px-4 py-2 text-sm font-medium ${formData.status === Status.INACTIVE ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                               >
                                 Ngừng
                               </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'EDU' && (
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-indigo-500 pl-2">Học vị</h3>
                            <button onClick={handleEducationAdd} className="flex items-center text-sm px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50">
                                <Plus size={16} className="mr-1" /> Thêm
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.educations?.map((edu) => (
                                <div key={edu.id} className="bg-gray-50 p-4 rounded border grid grid-cols-12 gap-4 items-end">
                                     <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Bậc</label>
                                        <select 
                                            value={edu.degree}
                                            onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                                        >
                                            <option value="">Chọn học vị</option>
                                            <option value="Cử nhân">Cử nhân</option>
                                            <option value="Thạc sĩ">Thạc sĩ</option>
                                            <option value="Tiến sĩ">Tiến sĩ</option>
                                            <option value="Cao đẳng">Cao đẳng</option>
                                        </select>
                                     </div>
                                     <div className="col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Trường</label>
                                        <input 
                                            type="text"
                                            value={edu.school}
                                            onChange={e => handleEducationChange(edu.id, 'school', e.target.value)}
                                            placeholder="Trường theo học"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                                        />
                                     </div>
                                     <div className="col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Chuyên ngành</label>
                                        <input 
                                            type="text"
                                            value={edu.major}
                                            onChange={e => handleEducationChange(edu.id, 'major', e.target.value)}
                                            placeholder="Chuyên ngành"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                                        />
                                     </div>
                                      <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
                                         <select 
                                            value={edu.status}
                                            onChange={e => handleEducationChange(edu.id, 'status', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                                        >
                                            <option value="Hoàn thành">Hoàn thành</option>
                                            <option value="Đang học">Đang học</option>
                                            <option value="Bảo lưu">Bảo lưu</option>
                                        </select>
                                     </div>
                                      <div className="col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Năm TN</label>
                                        <input 
                                            type="text"
                                            value={edu.year}
                                            onChange={e => handleEducationChange(edu.id, 'year', e.target.value)}
                                            placeholder="YYYY"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                                        />
                                     </div>
                                     <div className="col-span-1 flex justify-center pb-1">
                                         <button onClick={() => handleEducationRemove(edu.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                         </button>
                                     </div>
                                </div>
                            ))}
                            {(!formData.educations || formData.educations.length === 0) && (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded border border-dashed">
                                    <p>Chưa có thông tin học vị</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
            <Save size={18} className="mr-2" />
            Lưu
            </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherModal;