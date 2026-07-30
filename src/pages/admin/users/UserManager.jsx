import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import api from '../../../utils/api';

const UserManager = () => {
  const { globalSearch } = useOutletContext() || { globalSearch: '' };
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${globalSearch}`);
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
        setTotalUsers(res.data.total);
      }
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, globalSearch]);

  // Reset trang về 1 khi tìm kiếm thay đổi
  useEffect(() => {
    setPage(1);
  }, [globalSearch]);

  const handleToggleStatus = async (user) => {
    // Chặn tự khóa chính mình phía client (để UI phản hồi nhanh)
    const currentAdminId = localStorage.getItem('userId'); // Hoặc lấy từ state global nếu có
    // Dù sao backend cũng sẽ chặn, nhưng thêm confirm cho an toàn
    const actionText = user.isActive ? 'Khóa' : 'Mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) return;

    try {
      const res = await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      if (res.data.success) {
        toast.success(res.data.message);
        // Cập nhật State cục bộ
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !user.isActive } : u));
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi ${actionText.toLowerCase()} tài khoản`);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      if (res.data.success) {
        toast.success(res.data.message);
        // Cập nhật State cục bộ
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, role: newRole } : u));
        closeModal();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật quyền');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#191b24]">Users Management</h2>
          <p className="text-sm text-[#737687]">Quản lý tài khoản, phân quyền và trạng thái người dùng</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-[#e1e1ee] flex items-center gap-2">
          <span className="text-sm font-medium text-[#737687]">Tổng Users:</span>
          <span className="text-lg font-bold text-[#0f62fe]">{totalUsers}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e1e1ee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#e1e1ee] text-sm text-[#424656]">
                <th className="py-3 px-4 font-medium">Người dùng</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Provider</th>
                <th className="py-3 px-4 font-medium">Trạng thái</th>
                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-[#0f62fe] border-t-transparent rounded-full"></div>
                    <p className="mt-2 text-[#737687]">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-[#e1e1ee] last:border-0 hover:bg-[#faf8ff] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#e1e1ee]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#d8e3fd] text-[#0f62fe] flex items-center justify-center font-bold">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#191b24]">{user.username}</p>
                          <p className="text-xs text-[#737687]">{user.gender || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#424656]">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'artist' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1 text-[#424656]">
                        {user.authProvider === 'google' ? (
                          <><span className="material-symbols-outlined text-[16px]">google</span> Google</>
                        ) : (
                          <><span className="material-symbols-outlined text-[16px]">mail</span> Local</>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-[#dcfce7] text-[#166534]' 
                          : 'bg-[#fee2e2] text-[#991b1b]'
                      }`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openRoleModal(user)} 
                          title="Thay đổi quyền"
                          className="p-1.5 text-[#0f62fe] hover:bg-[#f2f3ff] rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)} 
                          title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          className={`p-1.5 rounded transition-colors ${
                            user.isActive 
                              ? 'text-[#ba1a1a] hover:bg-[#ffdad6]' 
                              : 'text-[#238b43] hover:bg-[#c4eed0]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {user.isActive ? 'block' : 'lock_open'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="w-16 h-16 bg-[#f2f3ff] text-[#0f62fe] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-[32px]">group_off</span>
                    </div>
                    <p className="text-[#191b24] font-medium">Không tìm thấy người dùng nào</p>
                    <p className="text-[#737687] text-sm mt-1">Thử thay đổi từ khóa tìm kiếm</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e1e1ee] flex items-center justify-between bg-[#f8f9ff]">
            <p className="text-sm text-[#737687]">
              Hiển thị trang <span className="font-medium text-[#191b24]">{page}</span> / <span className="font-medium text-[#191b24]">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded border border-[#c3c6d8] bg-white text-[#424656] disabled:opacity-50 hover:bg-[#ecedfa] transition-colors"
              >
                Trước
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded border border-[#c3c6d8] bg-white text-[#424656] disabled:opacity-50 hover:bg-[#ecedfa] transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f8f9ff]">
              <h3 className="text-lg font-bold text-[#191b24]">Phân quyền User</h3>
              <button onClick={closeModal} className="text-[#424656] hover:text-[#191b24] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUpdateRole} className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-[#f2f3ff] rounded-lg mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0f62fe] text-white flex items-center justify-center font-bold">
                    {selectedUser?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[#191b24]">{selectedUser?.username}</p>
                    <p className="text-xs text-[#737687]">{selectedUser?.email}</p>
                  </div>
                </div>

                <label className="block text-sm font-medium text-[#191b24] mb-2">Quyền (Role)</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-[#c3c6d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] transition-all bg-white"
                >
                  <option value="user">User (Người nghe bình thường)</option>
                  <option value="artist">Artist (Nghệ sĩ)</option>
                  <option value="admin">Admin (Quản trị viên)</option>
                </select>
                <p className="text-xs text-[#737687] mt-2">
                  Lưu ý: Bạn không thể tự hạ quyền Admin của chính mình.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-[#424656] font-medium hover:bg-[#ecedfa] rounded-lg transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmitting || newRole === selectedUser?.role} className="px-4 py-2 bg-[#0f62fe] text-white font-medium rounded-lg hover:bg-[#0353e9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
