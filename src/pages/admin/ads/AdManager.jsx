import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const AdManager = () => {
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({ totalAds: 0, activeAds: 0, totalPlays: 0, totalClicks: 0, averageCtr: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    advertiserName: '',
    clickUrl: '',
    type: 'audio',
    durationSeconds: 15,
    isActive: true,
    priority: 1,
  });

  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        type: typeFilter,
        status: statusFilter,
      });
      const res = await api.get(`/admin/ads?${params.toString()}`);
      if (res.data.success) {
        setAds(res.data.ads || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      toast.error('Lỗi lấy danh sách quảng cáo');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, typeFilter, statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/admin/ads/stats`);
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAds();
    fetchStats();
  }, [fetchAds]);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (ad = null) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        advertiserName: ad.advertiserName,
        clickUrl: ad.clickUrl || '',
        type: ad.type,
        durationSeconds: ad.durationSeconds,
        isActive: ad.isActive,
        priority: ad.priority,
      });
    } else {
      setEditingAd(null);
      setFormData({
        title: '',
        advertiserName: '',
        clickUrl: '',
        type: 'audio',
        durationSeconds: 15,
        isActive: true,
        priority: 1,
      });
    }
    setAudioFile(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData();
    Object.keys(formData).forEach(key => form.append(key, formData[key]));
    if (audioFile) form.append('audio', audioFile);
    if (imageFile) form.append('image', imageFile);

    try {
      if (editingAd) {
        const res = await api.put(`/admin/ads/${editingAd._id}`, form);
        if (res.data.success) {
          toast.success('Cập nhật quảng cáo thành công');
          fetchAds();
          fetchStats();
          closeModal();
        } else {
          toast.error(res.data.message);
        }
      } else {
        const res = await api.post(`/admin/ads`, form);
        if (res.data.success) {
          toast.success('Thêm quảng cáo thành công');
          fetchAds();
          fetchStats();
          closeModal();
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      toast.error('Lỗi khi lưu quảng cáo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa quảng cáo này?')) {
      try {
        const res = await api.delete(`/admin/ads/${id}`);
        if (res.data.success) {
          toast.success('Xóa quảng cáo thành công');
          fetchAds();
          fetchStats();
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        toast.error('Lỗi khi xóa quảng cáo');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#191b24]">Ad Manager</h2>
          <p className="text-sm text-[#737687]">Quản lý quảng cáo Audio & Display</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f62fe] text-white rounded-md hover:bg-[#0353e9]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Quảng Cáo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e1e1ee]">
          <h3 className="text-sm font-medium text-[#737687]">Tổng Quảng Cáo</h3>
          <p className="text-2xl font-bold text-[#191b24]">{stats.totalAds}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e1e1ee]">
          <h3 className="text-sm font-medium text-[#737687]">Đang Hoạt Động</h3>
          <p className="text-2xl font-bold text-[#0f62fe]">{stats.activeAds}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e1e1ee]">
          <h3 className="text-sm font-medium text-[#737687]">Tổng Lượt Phát</h3>
          <p className="text-2xl font-bold text-[#ba1a1a]">{stats.totalPlays}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e1e1ee]">
          <h3 className="text-sm font-medium text-[#737687]">Tổng Lượt Click</h3>
          <p className="text-2xl font-bold text-[#191b24]">{stats.totalClicks}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e1e1ee]">
          <h3 className="text-sm font-medium text-[#737687]">CTR Trung Bình</h3>
          <p className="text-2xl font-bold text-[#238b43]">{stats.averageCtr}%</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e1e1ee] flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737687] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nhà quảng cáo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-[#c3c6d8] rounded-md text-sm outline-none focus:border-[#0f62fe] bg-white text-[#191b24]"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-[#c3c6d8] rounded-md py-2 px-3 text-sm bg-white text-[#191b24] outline-none focus:border-[#0f62fe] cursor-pointer"
          >
            <option value="">Tất cả loại QC</option>
            <option value="audio">Audio Ad</option>
            <option value="banner">Banner Ad</option>
            <option value="rewarded">Rewarded Video</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-[#c3c6d8] rounded-md py-2 px-3 text-sm bg-white text-[#191b24] outline-none focus:border-[#0f62fe] cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm dừng</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e1e1ee] overflow-hidden shadow-xs flex flex-col">
        {isLoading ? (
          <div className="py-12 text-center text-[#737687]">Đang tải danh sách quảng cáo...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9ff] border-b border-[#e1e1ee] text-sm text-[#424656]">
                    <th className="py-3 px-4 font-medium text-center w-12">STT</th>
                    <th className="py-3 px-4 font-medium">Chi tiết Quảng Cáo</th>
                    <th className="py-3 px-4 font-medium">Nhà Quảng Cáo</th>
                    <th className="py-3 px-4 font-medium">Loại</th>
                    <th className="py-3 px-4 font-medium">Chỉ số</th>
                    <th className="py-3 px-4 font-medium">Trạng thái</th>
                    <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad, index) => {
                    const itemIndex = (page - 1) * limit + index + 1;
                    return (
                      <tr key={ad._id} className="border-b border-[#e1e1ee] last:border-0 hover:bg-[#faf8ff] transition-colors">
                        <td className="py-3 px-4 text-xs text-[#737687] text-center font-medium">{itemIndex}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={ad.bannerImageUrl} alt={ad.title} className="w-12 h-12 rounded object-cover" />
                            <div>
                              <p className="font-medium text-[#191b24]">{ad.title}</p>
                              <p className="text-xs text-[#737687]">{ad.durationSeconds}s • Trọng số: {ad.priority}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#424656]">{ad.advertiserName}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ad.type === 'audio' ? 'bg-blue-100 text-blue-700' :
                            ad.type === 'banner' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {ad.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-[#424656]">
                            <p>Plays: {ad.playCount}</p>
                            <p>Clicks: {ad.clickCount}</p>
                            <p className="font-medium text-[#238b43]">CTR: {ad.playCount > 0 ? ((ad.clickCount / ad.playCount) * 100).toFixed(2) : 0}%</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ad.isActive ? 'bg-[#d8e3fd] text-[#0f62fe]' : 'bg-[#e3e2e6] text-[#44474e]'}`}>
                            {ad.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal(ad)} className="p-1.5 text-[#0f62fe] hover:bg-[#f2f3ff] rounded transition-colors" title="Sửa">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(ad._id)} className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors" title="Xóa">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {ads.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-[#737687]">Chưa có quảng cáo nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#e1e1ee] bg-[#faf8ff] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#424656]">
              <div className="flex items-center gap-3">
                <span>
                  Hiển thị <span className="font-bold text-[#191b24]">{total > 0 ? (page - 1) * limit + 1 : 0}</span> - <span className="font-bold text-[#191b24]">{Math.min(page * limit, total)}</span> trên tổng số <span className="font-bold text-[#191b24]">{total}</span> quảng cáo
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-[#c3c6d8] rounded py-1 px-2 text-xs bg-white focus:outline-none focus:border-[#0f62fe]"
                >
                  <option value={10}>10 dòng / trang</option>
                  <option value={20}>20 dòng / trang</option>
                  <option value={50}>50 dòng / trang</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded border border-[#c3c6d8] bg-white hover:bg-[#f2f3ff] disabled:opacity-40 disabled:hover:bg-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  Trang trước
                </button>
                <div className="px-3 py-1 font-semibold text-[#191b24]">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded border border-[#c3c6d8] bg-white hover:bg-[#f2f3ff] disabled:opacity-40 disabled:hover:bg-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  Trang sau
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e1e1ee] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#191b24]">{editingAd ? 'Sửa Quảng Cáo' : 'Thêm Quảng Cáo'}</h3>
              <button onClick={closeModal} className="text-[#424656] hover:text-[#191b24]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#191b24] mb-1">Tiêu đề Quảng cáo</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#c3c6d8] rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#191b24] mb-1">Tên Nhà QC / Thương hiệu</label>
                  <input required type="text" name="advertiserName" value={formData.advertiserName} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#c3c6d8] rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#191b24] mb-1">Loại Quảng cáo</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#c3c6d8] rounded-md">
                    <option value="audio">Audio Ad (Có hình + Tiếng)</option>
                    <option value="banner">Banner Ad (Chỉ hình)</option>
                    <option value="rewarded">Rewarded Video (Cấp Premium tạm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#191b24] mb-1">Thời lượng (giây)</label>
                  <input type="number" name="durationSeconds" value={formData.durationSeconds} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#c3c6d8] rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#191b24] mb-1">Đường dẫn khi Click (URL)</label>
                <input type="text" name="clickUrl" value={formData.clickUrl} onChange={handleInputChange} placeholder="https://..." className="w-full px-3 py-2 border border-[#c3c6d8] rounded-md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#191b24] mb-1">Trọng số hiển thị (Priority)</label>
                  <input type="number" min="1" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#c3c6d8] rounded-md" />
                  <p className="text-xs text-[#737687] mt-1">Càng cao xuất hiện càng nhiều</p>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-[#0f62fe] rounded" />
                    <span className="text-sm font-medium text-[#191b24]">Kích hoạt chạy ngay</span>
                  </label>
                </div>
              </div>

              <div className="border border-[#c3c6d8] rounded-md p-4 bg-[#f8f9ff]">
                <h4 className="font-medium text-[#191b24] mb-4">Files Media</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#191b24] mb-1">Ảnh Banner / Cover {editingAd ? '(Để trống nếu không đổi)' : '*'}</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm" />
                    {editingAd && editingAd.bannerImageUrl && <img src={editingAd.bannerImageUrl} alt="Preview" className="h-12 mt-2 rounded" />}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#191b24] mb-1">File Audio (.mp3) {editingAd ? '(Để trống nếu không đổi)' : (formData.type !== 'banner' ? '*' : '')}</label>
                    <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full text-sm" />
                    {editingAd && editingAd.audioUrl && <audio src={editingAd.audioUrl} controls className="h-8 mt-2 w-full" />}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e1ee]">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-[#424656] font-medium hover:bg-[#ecedfa] rounded-md">Hủy</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[#0f62fe] text-white font-medium rounded-md hover:bg-[#0353e9] disabled:opacity-50">
                  {isLoading ? 'Đang lưu...' : 'Lưu Quảng Cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdManager;
