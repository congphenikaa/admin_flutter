import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ArtistRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');
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
        <div className="p-6">
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
                                    <td className="px-6 py-4">
                                        {req.status === 'pending' && (
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleApprove(req._id)}
                                                    className="px-4 py-1.5 text-sm bg-[#004ccd] text-white rounded-md hover:bg-[#003da9]"
                                                >
                                                    Duyệt
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(req._id)}
                                                    className="px-4 py-1.5 text-sm bg-[#ba1a1a] text-white rounded-md hover:bg-[#93000a]"
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ArtistRequests;