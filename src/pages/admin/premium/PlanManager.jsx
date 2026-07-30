import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const initialForm = {
  code: '',
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  badgeText: '',
  durationDays: '',
  features: '',
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
  maxRoomListeners: 2,
  allowFreeListeners: true,
  maxGroupMembers: 5,
};

const PlanManager = () => {
  const { globalSearch } = useOutletContext();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Phân trang
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchPlans = useCallback(async (currentPage = page, currentLimit = limit) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/premium/plans', {
        params: {
          page: currentPage,
          limit: currentLimit,
          search: globalSearch || '',
        },
      });
      if (res.data.success) {
        setPlans(res.data.plans || []);
        setTotal(res.data.total || 0);
      } else {
        toast.error(res.data.message || 'Không tải được danh sách gói');
      }
    } catch (error) {
      toast.error('Không tải được danh sách gói');
    } finally {
      setLoading(false);
    }
  }, [globalSearch]);

  useEffect(() => {
    setPage(1);
  }, [globalSearch]);

  useEffect(() => {
    fetchPlans(page, limit);
  }, [page, limit, fetchPlans]);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);

  const openAdd = () => {
    setEditingPlan(null);
    setForm(initialForm);
    setView('add');
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      code: plan.code || '',
      title: plan.title || '',
      description: plan.description || '',
      price: plan.price ?? '',
      originalPrice: plan.originalPrice ?? '',
      badgeText: plan.badgeText || '',
      durationDays: plan.durationDays ?? '',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      sortOrder: plan.sortOrder ?? 0,
      isFeatured: !!plan.isFeatured,
      isActive: plan.isActive !== false,
      maxRoomListeners: plan.maxRoomListeners ?? 2,
      allowFreeListeners: plan.allowFreeListeners !== false,
      maxGroupMembers: plan.maxGroupMembers ?? 5,
    });
    setView('edit');
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.code || !form.title || !form.description || !form.price || !form.durationDays) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc của gói');
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
        durationDays: Number(form.durationDays),
        sortOrder: Number(form.sortOrder) || 0,
        features: form.features,
        maxRoomListeners: Number(form.maxRoomListeners) || 2,
        allowFreeListeners: !!form.allowFreeListeners,
        maxGroupMembers: Number(form.maxGroupMembers) || 5,
      };

      const response = editingPlan
        ? await api.put(`/admin/premium/plans/${editingPlan._id}`, payload)
        : await api.post('/admin/premium/plans', payload);

      if (response.data.success) {
        toast.success(editingPlan ? 'Cập nhật gói thành công' : 'Thêm gói thành công');
        await fetchPlans(page, limit);
        setView('list');
      } else {
        toast.error(response.data.message || 'Thao tác thất bại');
      }
    } catch (error) {
      toast.error('Không lưu được gói premium');
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Xóa gói ${plan.title}?`)) return;

    try {
      const response = await api.delete(`/admin/premium/plans/${plan._id}`);
      if (response.data.success) {
        toast.success('Đã xóa gói');
        const newPage = (plans.length === 1 && page > 1) ? page - 1 : page;
        setPage(newPage);
        await fetchPlans(newPage, limit);
      } else {
        toast.error(response.data.message || 'Xóa thất bại');
      }
    } catch (error) {
      toast.error('Không xóa được gói');
    }
  };

  return (
    <div className="w-full relative">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Quản lý gói Premium</h1>
          <p className="text-sm text-[#737687]">Thiết lập gói đăng ký, quyền hạn Phòng nhạc & Group Chat.</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm Gói
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 text-center text-[#737687]">Đang tải danh sách gói...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] w-12 text-center">STT</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Gói</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Giá</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Thời lượng</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Quyền phòng & Group</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Trạng thái</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {plans.length > 0 ? plans.map((plan, index) => {
                  const itemIndex = (page - 1) * limit + index + 1;
                  return (
                    <tr key={plan._id} className="hover:bg-[#faf8ff] transition-colors group">
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#737687] font-medium text-center">{itemIndex}</td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#191b24] text-sm">{plan.title}</p>
                            {plan.badgeText ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#0f62fe] text-[10px] font-bold">{plan.badgeText}</span>
                            ) : null}
                          </div>
                          <p className="text-xs text-[#737687] font-mono">{plan.code}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#191b24] font-medium">
                        {Number(plan.price || 0).toLocaleString('vi-VN')}đ
                        {plan.originalPrice ? (
                          <span className="ml-2 text-xs text-[#737687] line-through">{Number(plan.originalPrice).toLocaleString('vi-VN')}đ</span>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656]">{plan.durationDays} ngày</td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee]">
                        <div className="text-xs text-[#424656] space-y-0.5">
                          <div>Phòng: <span className="font-semibold text-[#0f62fe]">{plan.maxRoomListeners ?? 2} listeners</span></div>
                          <div>Group: <span className="font-semibold text-[#0f62fe]">{plan.maxGroupMembers ?? 5} thành viên</span></div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee]">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {plan.isActive ? 'Hoạt động' : 'Tạm tắt'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-right">
                        <div className="flex gap-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(plan)} className="p-1.5 text-[#737687] hover:text-[#0f62fe] hover:bg-[#ecedfa] rounded transition-colors" title="Sửa">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(plan)} className="p-1.5 text-[#737687] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors" title="Xóa">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="7" className="p-8 text-center text-[#737687] text-sm">Chưa có dữ liệu gói premium.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-[#e1e1ee] bg-[#faf8ff] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#424656]">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị <span className="font-bold text-[#191b24]">{total > 0 ? (page - 1) * limit + 1 : 0}</span> - <span className="font-bold text-[#191b24]">{Math.min(page * limit, total)}</span> trên tổng số <span className="font-bold text-[#191b24]">{total}</span> gói
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
      </div>

      {/* Add / Edit Drawer Modal */}
      {(view === 'add' || view === 'edit') && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
          <div className="absolute inset-0" onClick={() => setView('list')}></div>
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl animate-[slideInRight_0.3s_ease-out] overflow-y-auto">
            <div className="p-6 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#191b24]">{view === 'add' ? 'Thêm Gói Premium' : 'Cập nhật Gói Premium'}</h2>
                <p className="text-xs text-[#737687] mt-0.5">Thiết lập cấu hình thông số kỹ thuật và giá cước gói.</p>
              </div>
              <button onClick={() => setView('list')} className="text-[#737687] hover:bg-[#ecedfa] p-1.5 rounded-md transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Mã gói <span className="text-red-500">*</span></label>
                  <input
                    value={form.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe] font-mono"
                    placeholder="MONTH_VIP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Tên gói hiển thị <span className="text-red-500">*</span></label>
                  <input
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                    placeholder="Premium Cá Nhân (1 Tháng)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Mô tả ngắn <span className="text-red-500">*</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows="2"
                  className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                  placeholder="Mô tả các quyền lợi cho khách hàng"
                />
              </div>

              {/* Giá và thời lượng */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                    placeholder="59000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Giá gạch (Giá gốc)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => handleChange('originalPrice', e.target.value)}
                    className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                    placeholder="79000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Thời hạn (Số ngày) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.durationDays}
                    onChange={(e) => handleChange('durationDays', e.target.value)}
                    className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Cấu hình Room Tier & Group Chat */}
              <div className="p-4 bg-[#f2f3ff]/40 rounded-lg border border-[#e1e1ee] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0f62fe]">meeting_room</span>
                  <h3 className="text-sm font-bold text-[#191b24]">Cấu hình Phòng ảo & Group Chat (Room Tier)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#424656] mb-1">Max Listeners phòng ảo (Host)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxRoomListeners}
                      onChange={(e) => handleChange('maxRoomListeners', e.target.value)}
                      className="w-full border border-[#c3c6d8] rounded-md py-2 px-3 text-sm bg-white outline-none focus:border-[#0f62fe]"
                      placeholder="2"
                    />
                    <p className="text-[11px] text-[#737687] mt-0.5">Số lượng người nghe tối đa trong phòng</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#424656] mb-1">Max thành viên Nhóm Cộng đồng</label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxGroupMembers}
                      onChange={(e) => handleChange('maxGroupMembers', e.target.value)}
                      className="w-full border border-[#c3c6d8] rounded-md py-2 px-3 text-sm bg-white outline-none focus:border-[#0f62fe]"
                      placeholder="5"
                    />
                    <p className="text-[11px] text-[#737687] mt-0.5">Số lượng thành viên nhóm tối đa</p>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#424656] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowFreeListeners}
                      onChange={(e) => handleChange('allowFreeListeners', e.target.checked)}
                      className="rounded border-[#c3c6d8] text-[#0f62fe] focus:ring-[#0f62fe]"
                    />
                    Cho phép Free Listener vào phòng trải nghiệm không bị ngắt bởi QC
                  </label>
                </div>
              </div>

              {/* Badge & Trạng thái */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Badge hiển thị</label>
                  <input
                    value={form.badgeText}
                    onChange={(e) => handleChange('badgeText', e.target.value)}
                    className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                    placeholder="KHUYÊN DÙNG"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Thứ tự sắp xếp</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => handleChange('sortOrder', e.target.value)}
                    className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="inline-flex items-center gap-2 text-sm text-[#424656] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => handleChange('isFeatured', e.target.checked)}
                    />
                    Nổi bật
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-[#424656] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                    />
                    Hoạt động
                  </label>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-[#191b24] mb-1.5">Danh sách tính năng (cách nhau bởi dấu phẩy)</label>
                <textarea
                  value={form.features}
                  onChange={(e) => handleChange('features', e.target.value)}
                  rows="3"
                  className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]"
                  placeholder="Không quảng cáo, Tải ngoại tuyến, Chất lượng 320kbps"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#e1e1ee]">
                <button
                  onClick={() => setView('list')}
                  className="flex-1 py-2.5 bg-white border border-[#c3c6d8] rounded-md text-[#424656] text-sm font-semibold hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-[#0f62fe] text-white rounded-md text-sm font-semibold shadow-sm hover:bg-[#004ccd] transition-colors cursor-pointer"
                >
                  {view === 'add' ? 'Thêm gói' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManager;