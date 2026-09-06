import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ArtistRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');
    
    // Thêm state để quản lý việc hiển thị chi tiết đơn
    const [selectedRequest, setSelectedRequest] = useState(null); 
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchRequests = async (status = '') => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${backendUrl}/api/artist-requests?status=${status}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data.data);
        } catch (error) {
            toast.error("Không thể tải danh sách đơn");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(filterStatus);
    }, [filterStatus]);

    const handleApprove = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn duyệt đơn này?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${backendUrl}/api/artist-requests/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã duyệt đơn thành công");
            setSelectedRequest(null); // Đóng modal sau khi duyệt
            fetchRequests(filterStatus);
        } catch (error) {
            toast.error("Duyệt đơn thất bại");
        }
    };

    const handleReject = async (id) => {
        const note = prompt("Nhập lý do từ chối (tùy chọn):");
        if (note === null) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${backendUrl}/api/artist-requests/${id}/reject`, 
                { adminNote: note }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã từ chối đơn");
            setSelectedRequest(null); // Đóng modal sau khi từ chối
            fetchRequests(filterStatus);
        } catch (error) {
            toast.error("Từ chối đơn thất bại");
        }
    };

    const getStatusBadge = (status) => {
        const base = "px-3 py-1 rounded-full text-xs font-medium";
        if (status === 'pending') return `${base} bg-yellow-100 text-yellow-700`;
        if (status === 'approved') return `${base} bg-green-100 text-green-700`;
        return `${base} bg-red-100 text-red-700`;
    };

    return (
        <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-[#191b24]">Quản lý đơn đề xuất Artist</h1>
                    <p className="text-sm text-[#424656] mt-1">Duyệt và quản lý các yêu cầu trở thành nghệ sĩ</p>
                </div>

                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-[#c3c6d8] bg-white px-4 py-2 rounded-md text-sm focus:outline-none focus:border-[#004ccd]"
                >
                    <option value="pending">Đang chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                    <option value="">Tất cả</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10 text-[#424656]">Đang tải dữ liệu...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-10 text-[#424656]">Không có đơn nào.</div>
            ) : (
                <div className="bg-white border border-[#e1e1ee] rounded-xl overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-[#f2f3ff]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#191b24]">Người dùng</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#191b24]">Tên Artist</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#191b24]">Ngày gửi</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#191b24]">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-[#191b24]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e1e1ee]">
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-[#f8f9ff]">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-[#191b24]">{req.user?.username}</p>
                                            <p className="text-sm text-[#737687]">{req.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#191b24]">{req.artistName}</td>
                                    <td className="px-6 py-4 text-sm text-[#424656]">
                                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={getStatusBadge(req.status)}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Thay đổi nút hành động thành nút Xem chi tiết */}
                                        <button 
                                            onClick={() => setSelectedRequest(req)}
                                            className="px-4 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal hiển thị chi tiết */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Chi tiết đơn đề xuất</h2>
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase">Thông tin người dùng</h3>
                                <p className="mt-1"><span className="font-medium">Tài khoản:</span> {selectedRequest.user?.username} ({selectedRequest.user?.email})</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase">Thông tin Artist</h3>
                                <p className="mt-1"><span className="font-medium">Nghệ danh:</span> {selectedRequest.artistName}</p>
                                <p className="mt-1"><span className="font-medium">Thể loại:</span> {selectedRequest.genre?.join(', ') || 'Không có'}</p>
                                <p className="mt-1"><span className="font-medium">Giới thiệu:</span> {selectedRequest.bio || 'Không có'}</p>
                                <p className="mt-1"><span className="font-medium">Lý do:</span> {selectedRequest.reason || 'Không có'}</p>
                            </div>

                            {selectedRequest.socialLinks && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Mạng xã hội</h3>
                                    {selectedRequest.socialLinks.instagram && <p className="mt-1"><span className="font-medium">Instagram:</span> <a href={selectedRequest.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-blue-600 underline">{selectedRequest.socialLinks.instagram}</a></p>}
                                    {selectedRequest.socialLinks.youtube && <p className="mt-1"><span className="font-medium">YouTube:</span> <a href={selectedRequest.socialLinks.youtube} target="_blank" rel="noreferrer" className="text-blue-600 underline">{selectedRequest.socialLinks.youtube}</a></p>}
                                    {selectedRequest.socialLinks.tiktok && <p className="mt-1"><span className="font-medium">TikTok:</span> <a href={selectedRequest.socialLinks.tiktok} target="_blank" rel="noreferrer" className="text-blue-600 underline">{selectedRequest.socialLinks.tiktok}</a></p>}
                                </div>
                            )}
                        </div>

                        {selectedRequest.status === 'pending' && (
                            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                                <button 
                                    onClick={() => handleReject(selectedRequest._id)}
                                    className="px-6 py-2 bg-[#ba1a1a] text-white rounded-md hover:bg-[#93000a] font-medium"
                                >
                                    Từ chối
                                </button>
                                <button 
                                    onClick={() => handleApprove(selectedRequest._id)}
                                    className="px-6 py-2 bg-[#004ccd] text-white rounded-md hover:bg-[#003da9] font-medium"
                                >
                                    Phê duyệt
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistRequests;