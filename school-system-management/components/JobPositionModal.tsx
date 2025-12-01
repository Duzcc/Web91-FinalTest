import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { JobPosition } from '../types';
import { Status } from '../types';

interface JobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<JobPosition>) => void;
  initialData?: JobPosition | null;
}

const JobPositionModal: React.FC<JobPositionModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<JobPosition>>({
    code: '',
    name: '',
    description: '',
    status: Status.ACTIVE,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        // *** ĐÃ SỬA: Sử dụng spread operator để giữ tất cả dữ liệu gốc ***
        ...initialData,
        // Đảm bảo description luôn là chuỗi
        description: initialData.description || '',
        status: initialData.status,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '', 
        status: Status.ACTIVE,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.code || !formData.name) {
      alert('Vui lòng nhập Mã và Tên vị trí công tác.');
      return;
    }
    const apiData: Partial<JobPosition> = {
      // Đảm bảo gửi giá trị description hiện tại của form
      ...formData,
      status: formData.status === Status.ACTIVE ? 'ACTIVE' : 'INACTIVE',
    };

    onSave(apiData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50">
      <div className="h-full w-full max-w-lg bg-white shadow-xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? 'Cập nhật vị trí công tác' : 'Vị trí công tác'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="code"
              value={formData.code || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nhập mã (Mã này là duy nhất)"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nhập tên vị trí"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label>
            <textarea
              name="description" 
              value={formData.description || ''} // Giá trị luôn là chuỗi
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái <span className="text-red-500">*</span></label>
            <div className="flex items-center space-x-0 border border-gray-300 rounded-md w-fit overflow-hidden">
               <button
                 type="button"
                 onClick={() => setFormData({...formData, status: Status.ACTIVE})}
                 className={`px-4 py-2 text-sm font-medium ${formData.status === Status.ACTIVE ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
               >
                 Hoạt động
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

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-2"
          >
            <Save size={16} className="mr-2" />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPositionModal;