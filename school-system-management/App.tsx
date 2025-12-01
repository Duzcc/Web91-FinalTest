import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Database, 
  ChevronDown, 
  ChevronRight,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Settings,
  Menu,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { JobPosition, Teacher, ViewState, Status, Pagination } from './types';
import { INITIAL_JOB_POSITIONS, INITIAL_TEACHERS } from './constants';
import JobPositionModal from './components/JobPositionModal';
import TeacherModal from './components/TeacherModal';
import { fetchJobPositions, createJobPosition, fetchTeachers, createTeacher } from './api';
// import Toast from './components/Toast'; // Giả định có component Toast để hiển thị thông báo

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div 
    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl text-white z-[60] transition-transform duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
    role="alert"
    onClick={onClose}
  >
    {message}
  </div>
);


function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.TEACHERS);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(true);
  
  // Data State
  const [jobPositions, setJobPositions] = useState<JobPosition[]>(INITIAL_JOB_POSITIONS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination & Search State (2.1)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
  
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // --- Fetch Data Functions ---
  const fetchAllJobPositions = useCallback(async () => { // 2.3
    setIsLoading(true);
    const data = await fetchJobPositions();
    setJobPositions(data);
    setIsLoading(false);
  }, []);
  
  const fetchAllTeachers = useCallback(async (page: number = pagination.page, limit: number = pagination.limit) => { // 2.1
    setIsLoading(true);
    const result = await fetchTeachers(page, limit);
    if (result.teachers) {
      setTeachers(result.teachers);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } else {
       setTeachers([]);
       setPagination({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });
    }
    setIsLoading(false);
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAllJobPositions();
  }, [fetchAllJobPositions]);

  useEffect(() => {
    if (currentView === ViewState.TEACHERS) {
      fetchAllTeachers();
    }
  }, [currentView, fetchAllTeachers]);

  // Handle Pagination (2.1)
  const handlePageChange = (newPage: number) => {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchAllTeachers(newPage, pagination.limit);
  };
  
  // --- Handlers - Job Position ---
  const handleAddJob = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (data: Partial<JobPosition>) => { // 2.4
    if (editingJob) {
      setToast({ message: 'Tính năng cập nhật chưa được triển khai API.', type: 'error' });
    } else {
      const result = await createJobPosition(data);
      if (result.success) {
        setToast({ message: result.message, type: 'success' });
        fetchAllJobPositions(); // Refresh list
      } else {
        setToast({ message: result.message, type: 'error' });
      }
    }
    setIsJobModalOpen(false);
  };

  // --- Handlers - Teacher ---
  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = async (data: Partial<Teacher>) => { // 2.2
    if (editingTeacher) {
       setToast({ message: 'Tính năng cập nhật chưa được triển khai API.', type: 'error' });
    } else {
      const result = await createTeacher(data);
      if (result.success && result.teacher) {
        setToast({ message: result.message, type: 'success' });
        fetchAllTeachers(1, pagination.limit); // Quay về trang 1 sau khi tạo mới
      } else {
        setToast({ message: result.message, type: 'error' });
      }
    }
    setIsTeacherModalOpen(false);
  };

  const handleEditJob = (job: JobPosition) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };
  
  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsTeacherModalOpen(true);
  };

  // Render Helpers
  const renderBreadcrumb = () => {
    const main = currentView === ViewState.JOB_POSITIONS ? 'Dữ liệu' : 'Giáo viên';
    const sub = currentView === ViewState.JOB_POSITIONS ? 'Vị trí công tác' : 
                currentView === ViewState.TEACHERS ? 'Danh sách giáo viên' : 'Hệ thống';
    return (
      <div className="flex items-center text-sm text-gray-500">
        <span className={currentView === ViewState.JOB_POSITIONS ? "text-orange-500 font-medium" : ""}>{main}</span>
        <span className="mx-2">/</span>
        <span>{sub}</span>
      </div>
    );
  };

  const filteredTeachers = teachers.filter(t => 
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.code.includes(searchTerm) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Tạo mảng số trang để render nút phân trang
  const pageNumbers = [];
  for (let i = 1; i <= pagination.totalPages; i++) {
    pageNumbers.push(i);
  }


  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* Sidebar (Giữ nguyên) */}
      <aside className="w-64 bg-white shadow-md flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <BookOpen className="text-indigo-600 w-8 h-8 mr-2" />
          <span className="text-xl font-bold text-indigo-700 tracking-tight">School System</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <button 
            onClick={() => setCurrentView(ViewState.DASHBOARD)}
            className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.DASHBOARD ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            Thống kê
          </button>

          <button className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <BookOpen size={20} className="mr-3" />
              Lớp học
            </div>
            <ChevronDown size={16} />
          </button>

          <button className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
            <div className="flex items-center">
              <Users size={20} className="mr-3" />
              Học sinh
            </div>
            <ChevronDown size={16} />
          </button>

          <button 
             onClick={() => setCurrentView(ViewState.TEACHERS)}
             className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.TEACHERS ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={20} className="mr-3" />
            Giáo viên
          </button>

          {/* Collapsible Data Menu */}
          <div>
            <button 
              onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
              className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.JOB_POSITIONS ? 'text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <Database size={20} className="mr-3" />
                Dữ liệu
              </div>
              {isDataMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {isDataMenuOpen && (
              <div className="pl-11 pr-2 space-y-1 mt-1">
                 <button 
                  onClick={() => setCurrentView(ViewState.JOB_POSITIONS)}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md ${currentView === ViewState.JOB_POSITIONS ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                  Vị trí công tác
                 </button>
                 <button className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md">
                  Môn học
                 </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header (Giữ nguyên) */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
             <div className="mr-6 font-medium text-indigo-700 text-sm">
                {new Date().toLocaleString('vi-VN')} 
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">Hệ thống</span>
             </div>
             {renderBreadcrumb()}
          </div>

          <div className="flex items-center space-x-4">
             <button className="p-2 text-gray-400 hover:text-gray-600 relative">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
                   <UserIcon size={16} />
                </div>
                <div className="text-right">
                   <p className="text-sm font-semibold text-gray-700 leading-none">Admin</p>
                   <span className="text-xs text-orange-500 font-bold bg-orange-100 px-1 rounded">ADMIN</span>
                </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          
          {/* TEACHERS VIEW (2.1) */}
          {currentView === ViewState.TEACHERS && (
            <div className="space-y-4 animate-fade-in">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                 <div className="relative w-full sm:w-96 mb-3 sm:mb-0">
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm thông tin (Tên, email, mã...)"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 </div>
                 <div className="flex space-x-2">
                    <button 
                       onClick={() => fetchAllTeachers(1, pagination.limit)} // Tải lại về trang 1
                       className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 text-sm"
                    >
                       <RefreshCw size={16} className="mr-2" />
                       Tải lại
                    </button>
                    <button 
                      onClick={handleAddTeacher}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm shadow-sm"
                    >
                       <Plus size={16} className="mr-2" />
                       Tạo mới
                    </button>
                 </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-indigo-50 text-indigo-900 font-semibold uppercase text-xs">
                        <tr>
                          <th className="px-6 py-4">Mã</th>
                          <th className="px-6 py-4">Giáo viên</th>
                          <th className="px-6 py-4">Học vấn (Trình độ/Trường)</th>
                          <th className="px-6 py-4">Vị trí công tác</th>
                          <th className="px-6 py-4">Địa chỉ</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={7} className="text-center py-8 text-indigo-500">Đang tải dữ liệu...</td></tr>
                        ) : filteredTeachers.length === 0 ? (
                           <tr><td colSpan={7} className="text-center py-8 text-gray-400">Không tìm thấy giáo viên nào.</td></tr>
                        ) : (
                        filteredTeachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-600">{teacher.code}</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center">
                                  <img src={teacher.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200" onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${teacher.fullName || 'User'}&background=random`)} />
                                  <div>
                                     <div className="font-bold text-gray-900">{teacher.fullName}</div>
                                     <div className="text-xs text-gray-500 italic">{teacher.email}</div>
                                     <div className="text-xs text-gray-500">{teacher.phone}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-gray-900">Bậc: {teacher.highestDegree || 'N/A'}</div>
                               <div className="text-xs text-gray-500">Trường: {teacher.highestSchool || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                               {teacher.jobPositions.map(j => (
                                  <div key={j.id} className="text-xs">{j.name}</div>
                               ))}
                               {teacher.jobPositions.length === 0 && 'Chưa phân công'}
                            </td>
                            <td className="px-6 py-4 text-gray-700">{teacher.address}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${teacher.status === Status.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {teacher.status === Status.ACTIVE ? 'Đang công tác' : 'Ngừng'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                 onClick={() => handleEditTeacher(teacher)}
                                 className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                               >
                                  <Eye size={14} className="mr-1" /> Chi tiết
                               </button>
                            </td>
                          </tr>
                        )))}
                      </tbody>
                   </table>
                 </div>
                 
                 {/* Pagination (2.1) */}
                 <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end bg-gray-50">
                    <div className="text-xs text-gray-500 mr-4">
                        {pagination.totalItems > 0 ? `Tổng: ${pagination.totalItems} | Trang ${pagination.page}/${pagination.totalPages}` : 'Không có dữ liệu'}
                    </div>
                    <div className="flex items-center space-x-1">
                       <button 
                           onClick={() => handlePageChange(pagination.page - 1)} 
                           disabled={pagination.page <= 1 || isLoading}
                           className="px-2 py-1 border rounded text-xs bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           &lt;
                       </button>
                       {pageNumbers.map(p => (
                           <button 
                               key={p} 
                               onClick={() => handlePageChange(p)}
                               className={`px-2 py-1 border rounded text-xs font-bold transition-colors ${pagination.page === p ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                           >
                               {p}
                           </button>
                       ))}
                       <button 
                           onClick={() => handlePageChange(pagination.page + 1)} 
                           disabled={pagination.page >= pagination.totalPages || isLoading}
                           className="px-2 py-1 border rounded text-xs bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           &gt;
                       </button>
                       <select 
                           className="ml-2 border rounded text-xs py-1 px-2 focus:outline-none"
                           value={pagination.limit}
                           onChange={(e) => {
                              const newLimit = parseInt(e.target.value);
                              setPagination(prev => ({ ...prev, limit: newLimit }));
                              fetchAllTeachers(1, newLimit); // Reset về trang 1 khi đổi limit
                           }}
                       >
                         <option value={10}>10 / trang</option>
                         <option value={20}>20 / trang</option>
                         <option value={50}>50 / trang</option>
                       </select>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* JOB POSITIONS VIEW (2.3) */}
          {currentView === ViewState.JOB_POSITIONS && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold text-gray-800">Danh sách vị trí công tác</h2>
                 <div className="flex space-x-2">
                    <button 
                      onClick={handleAddJob}
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    >
                       <Plus size={16} className="mr-2" />
                       Tạo
                    </button>
                    <button 
                       onClick={fetchAllJobPositions}
                       className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    >
                       <RefreshCw size={16} className="mr-2" />
                       Làm mới
                    </button>
                 </div>
              </div>

               <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-indigo-50 text-indigo-900 font-semibold uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4 w-16">STT</th>
                        <th className="px-6 py-4 w-32">Mã</th>
                        <th className="px-6 py-4 w-64">Tên</th>
                        <th className="px-6 py-4 w-40">Trạng thái</th>
                        <th className="px-6 py-4">Mô tả</th>
                        <th className="px-6 py-4 w-16 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-indigo-500">Đang tải dữ liệu...</td></tr>
                        ) : jobPositions.length === 0 ? (
                           <tr><td colSpan={6} className="text-center py-8 text-gray-400">Không có vị trí công tác nào.</td></tr>
                        ) : (
                        jobPositions.map((job, index) => (
                          <tr key={job.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEditJob(job)}>
                            <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-gray-700">{job.code}</td>
                            <td className="px-6 py-4 font-medium text-indigo-700">{job.name}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded ${job.status === Status.ACTIVE ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                  {job.status === Status.ACTIVE ? 'Hoạt động' : 'Ngừng'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{job.description}</td>
                            <td className="px-6 py-4 text-right">
                               <Settings size={16} className="text-gray-400 hover:text-indigo-600 inline-block" />
                            </td>
                          </tr>
                        )))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

           {/* DASHBOARD VIEW (Simple placeholder) */}
           {currentView === ViewState.DASHBOARD && (
             <div className="flex items-center justify-center h-full text-gray-400 animate-fade-in">
                <div className="text-center">
                  <LayoutDashboard size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Trang thống kê đang được cập nhật...</p>
                </div>
             </div>
           )}

        </main>
      </div>

      {/* MODALS */}
      <JobPositionModal 
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
        initialData={editingJob}
      />

      <TeacherModal 
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSave={handleSaveTeacher}
        initialData={editingTeacher}
        jobPositions={jobPositions}
      />
      
      {/* TOAST Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

export default App;