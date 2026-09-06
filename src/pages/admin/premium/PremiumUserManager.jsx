import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const FILTERS = [
  { value: 'all', label: 'Tất cả user' },
  { value: 'active', label: 'Đang active' },
  { value: 'expired', label: 'Đã hết hạn' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const daysLeft = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  return diff; // có thể âm nếu hết hạn
};

const initialGrantForm = {
  planCode: '',
  expireMode: 'days', // 'days' | 'date'
  durationDays: '',
  customExpiresAt: '',
  startDateMode: 'extend', // 'extend' | 'now'
};

const PremiumUserManager = () => {
  const { globalSearch } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Phân trang
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Grant modal
  const [grantTarget, setGrantTarget] = useState(null);
  const [grantForm, setGrantForm] = useState(initialGrantForm);
  const [grantLoading, setGrantLoading] = useState(false);

  const fetchUsers = useCallback(async (currentPage = page, currentFilter = filter, currentLimit = limit) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/premium/users', {
        params: {
          filter: currentFilter,
          page: currentPage,
          limit: currentLimit,
          search: globalSearch || '',
        },
      });
      if (res.data.success) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      } else {
        toast.error(res.data.message || 'Không tải được danh sách');
      }
    } catch {
      toast.error('Không tải được danh sách user premium');
    } finally {
      setLoading(false);
    }
  }, [globalSearch]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api.get('/admin/premium/plans?limit=100');
      if (res.data.success) setPlans(res.data.plans || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [globalSearch, filter]);

  useEffect(() => {
    fetchUsers(page, filter, limit);
    fetchPlans();
  }, [page, filter, limit, fetchUsers, fetchPlans]);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
  };

  const openGrant = (user) => {
    setGrantTarget(user);
    setGrantForm(initialGrantForm);
  };

  // Khi admin chọn 1 gói trong dropdown
  const handleSelectPlan = (code) => {
    if (!code) {
      setGrantForm((prev) => ({
        ...prev,
        planCode: '',
      }));
      return;
    }

    const selected = plans.find((p) => p.code === code);
    if (selected) {
      setGrantForm((prev) => ({
        ...prev,
        planCode: selected.code,
        durationDays: selected.durationDays ? String(selected.durationDays) : '30',
        expireMode: 'days',
        customExpiresAt: '',
      }));
    }
  };

  // Live preview ngày hết hạn mới
  const previewNewExpiresDate = useMemo(() => {
    if (!grantTarget) return null;
    if (grantForm.expireMode === 'date' && grantForm.customExpiresAt) {
      const d = new Date(grantForm.customExpiresAt);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const days = Number(grantForm.durationDays);
    if (!days || days <= 0) return null;

    const baseDate = (grantForm.startDateMode === 'extend' && grantTarget.isPremium && grantTarget.premiumExpiresAt && new Date(grantTarget.premiumExpiresAt) > new Date())
      ? new Date(grantTarget.premiumExpiresAt)
      : new Date();

    const result = new Date(baseDate);
    result.setDate(result.getDate() + days);
    return result;
  }, [grantTarget, grantForm]);

  const handleGrant = async () => {
    // Bắt buộc phải có gói
    if (!grantForm.planCode) {
      toast.error('Vui lòng chọn một gói Premium mẫu');
      return;
    }

    if (grantForm.expireMode === 'days') {
      if (!grantForm.durationDays || Number(grantForm.durationDays) <= 0) {
        toast.error('Vui lòng nhập số ngày hợp lệ');
        return;
      }
    } else {
      if (!grantForm.customExpiresAt) {
        toast.error('Vui lòng chọn ngày hết hạn cụ thể');
        return;
      }
      if (new Date(grantForm.customExpiresAt) <= new Date()) {
        toast.error('Ngày hết hạn phải lớn hơn thời điểm hiện tại');
        return;
      }
    }

    try {
      setGrantLoading(true);
      const payload = {
        planCode: grantForm.planCode,
        startDateMode: grantForm.startDateMode,
      };

      if (grantForm.expireMode === 'days') {
        payload.durationDays = Number(grantForm.durationDays);
      } else {
        payload.customExpiresAt = grantForm.customExpiresAt;
      }

      const res = await api.post(`/admin/premium/users/${grantTarget._id}/grant`, payload);
      if (res.data.success) {
        toast.success(`Đã cấp Premium thành công cho ${grantTarget.username}`);
        setGrantTarget(null);
        await fetchUsers(page, filter, limit);
      } else {
        toast.error(res.data.message || 'Cấp premium thất bại');
      }
    } catch {
      toast.error('Không thể cấp premium');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevoke = async (user) => {
    if (!window.confirm(`Thu hồi quyền Premium của tài khoản ${user.username}?`)) return;
    try {
      const res = await api.delete(`/admin/premium/users/${user._id}/revoke`);
      if (res.data.success) {
        toast.success(`Đã thu hồi Premium của ${user.username}`);
        await fetchUsers(page, filter, limit);
      } else {
        toast.error(res.data.message || 'Thu hồi thất bại');
      }
    } catch {
      toast.error('Không thể thu hồi premium');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full relative">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Quản lý tài khoản Premium</h1>
          <p className="text-sm text-[#737687]">Cấp gói, điều chỉnh thời hạn hoặc thu hồi quyền Premium cho người dùng.</p>
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                filter === f.value
                  ? 'bg-[#0f62fe] text-white border-[#0f62fe]'
                  : 'bg-white text-[#424656] border-[#c3c6d8] hover:bg-[#f2f3ff]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 text-center text-[#737687]">Đang tải danh sách...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] w-12 text-center">STT</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Người dùng</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Gói</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Kích hoạt</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Hết hạn</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Trạng thái</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user, idx) => {
                  const itemIndex = (page - 1) * limit + idx + 1;
                  const remaining = daysLeft(user.premiumExpiresAt);
                  // Dùng isExpired từ backend (đã tính chính xác), fallback nếu không có
                  const isExpired = user.isExpired || (!user.isPremium && user.premiumExpiresAt && remaining !== null && remaining <= 0);
                  const isWarn = user.isPremium && remaining !== null && remaining >= 0 && remaining <= 7;

                  return (
                    <tr key={user._id} className="hover:bg-[#faf8ff] transition-colors group">
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#737687] text-center font-medium">{itemIndex}</td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee]">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-[#e1e1ee]" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#0f62fe]">
                              <span className="material-symbols-outlined text-[18px]">person</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[#191b24] text-sm">{user.username}</p>
                            <p className="text-xs text-[#737687]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee]">
                        {user.premiumPlanCode ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#f2f3ff] text-[#0f62fe] text-[11px] font-bold uppercase tracking-wide">
                            {user.premiumPlanCode}
                          </span>
                        ) : <span className="text-[#737687] text-sm">—</span>}
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656]">{formatDate(user.premiumGrantedAt)}</td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656]">
                        <div>{formatDate(user.premiumExpiresAt)}</div>
                        {user.premiumExpiresAt && (
                          <div className={`text-xs font-medium mt-0.5 ${isExpired ? 'text-red-500' : isWarn ? 'text-orange-500' : (user.isPremium ? 'text-green-600' : 'text-[#737687]')}`}>
                            {isExpired
                              ? 'Đã hết hạn'
                              : user.isPremium && remaining !== null
                                ? `Còn ${remaining} ngày`
                                : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee]">
                        {isExpired ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Đã hết hạn</span>
                        ) : !user.isPremium ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#f2f3ff] text-[#737687]">Free</span>
                        ) : isWarn ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Sắp hết hạn</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Đang active</span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b border-[#e1e1ee] text-right">
                        <div className="flex gap-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Nút cấp / gia hạn: hiển thị với mọi user */}
                          <button
                            onClick={() => openGrant(user)}
                            className="p-1.5 text-[#737687] hover:text-[#0f62fe] hover:bg-[#ecedfa] rounded transition-colors cursor-pointer"
                            title={user.isPremium ? 'Gia hạn / Nâng cấp' : isExpired ? 'Gia hạn lại' : 'Cấp Premium'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {user.isPremium ? 'autorenew' : isExpired ? 'restart_alt' : 'workspace_premium'}
                            </span>
                          </button>
                          {/* Nút thu hồi: chỉ hiện khi đang active (isPremium = true), KHÔNG hiện khi đã hết hạn */}
                          {user.isPremium && (
                            <button
                              onClick={() => handleRevoke(user)}
                              className="p-1.5 text-[#737687] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors cursor-pointer"
                              title="Thu hồi Premium"
                            >
                              <span className="material-symbols-outlined text-[18px]">block</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="7" className="p-8 text-center text-[#737687] text-sm">Không tìm thấy người dùng nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#e1e1ee] bg-[#faf8ff] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#424656]">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị <span className="font-bold text-[#191b24]">{total > 0 ? (page - 1) * limit + 1 : 0}</span> - <span className="font-bold text-[#191b24]">{Math.min(page * limit, total)}</span> trên tổng số <span className="font-bold text-[#191b24]">{total}</span> tài khoản
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

      {/* Grant / Upgrade Premium Modal */}
      {grantTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="absolute inset-0" onClick={() => setGrantTarget(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e1e1ee]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#0f62fe]">
                  <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#191b24]">
                    {grantTarget.isPremium ? 'Gia hạn / Nâng cấp Premium' : 'Cấp quyền Premium'}
                  </h2>
                  <p className="text-xs text-[#737687]">{grantTarget.username} ({grantTarget.email})</p>
                </div>
              </div>
              <button
                onClick={() => setGrantTarget(null)}
                className="text-[#737687] hover:bg-[#ecedfa] p-1.5 rounded-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Bước 1: Chọn gói (Auto-fill) */}
              <div>
                <label className="block text-sm font-semibold text-[#191b24] mb-1.5">
                  1. Chọn gói Premium mẫu <span className="text-[#737687] font-normal">(Tự động điền)</span>
                </label>
                <select
                  value={grantForm.planCode}
                  onChange={(e) => handleSelectPlan(e.target.value)}
                  className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe] bg-white cursor-pointer font-medium text-[#191b24]"
                >
                  <option value="">— Chọn gói mẫu —</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan.code}>
                      ⭐ {plan.title} ({plan.durationDays} ngày - {Number(plan.price).toLocaleString('vi-VN')}đ)
                    </option>
                  ))}
                </select>
              </div>

              {/* Bước 2: Tinh chỉnh phương thức hạn sử dụng */}
              <div className="p-4 bg-[#f2f3ff]/50 rounded-lg border border-[#e1e1ee] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#191b24] uppercase tracking-wider">
                    2. Cấu hình thời hạn
                  </label>
                  <div className="flex bg-white rounded-md p-0.5 border border-[#c3c6d8]">
                    <button
                      type="button"
                      onClick={() => setGrantForm((p) => ({ ...p, expireMode: 'days' }))}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                        grantForm.expireMode === 'days'
                          ? 'bg-[#0f62fe] text-white shadow-xs'
                          : 'text-[#424656] hover:bg-[#f2f3ff]'
                      }`}
                    >
                      Theo số ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantForm((p) => ({ ...p, expireMode: 'date' }))}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                        grantForm.expireMode === 'date'
                          ? 'bg-[#0f62fe] text-white shadow-xs'
                          : 'text-[#424656] hover:bg-[#f2f3ff]'
                      }`}
                    >
                      Chọn ngày cụ thể
                    </button>
                  </div>
                </div>

                {grantForm.expireMode === 'days' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#424656] mb-1">
                        Số ngày cấp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={grantForm.durationDays}
                        onChange={(e) => setGrantForm((p) => ({ ...p, durationDays: e.target.value }))}
                        className="w-full border border-[#c3c6d8] rounded-md py-2 px-3 text-sm bg-white outline-none focus:border-[#0f62fe]"
                        placeholder="VD: 30 (Có thể sửa tặng thêm số ngày)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#424656] mb-1">Chế độ tính ngày bắt đầu</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label
                          onClick={() => setGrantForm((p) => ({ ...p, startDateMode: 'extend' }))}
                          className={`p-2 rounded-md border flex items-center gap-2 cursor-pointer transition-colors ${
                            grantForm.startDateMode === 'extend'
                              ? 'border-[#0f62fe] bg-white text-[#0f62fe] font-semibold'
                              : 'border-[#c3c6d8] bg-white text-[#424656]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="startDateMode"
                            checked={grantForm.startDateMode === 'extend'}
                            onChange={() => {}}
                            className="text-[#0f62fe]"
                          />
                          Nối tiếp hạn cũ
                        </label>
                        <label
                          onClick={() => setGrantForm((p) => ({ ...p, startDateMode: 'now' }))}
                          className={`p-2 rounded-md border flex items-center gap-2 cursor-pointer transition-colors ${
                            grantForm.startDateMode === 'now'
                              ? 'border-[#0f62fe] bg-white text-[#0f62fe] font-semibold'
                              : 'border-[#c3c6d8] bg-white text-[#424656]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="startDateMode"
                            checked={grantForm.startDateMode === 'now'}
                            onChange={() => {}}
                            className="text-[#0f62fe]"
                          />
                          Tính từ hôm nay
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#424656] mb-1">
                      Chọn ngày hết hạn trực tiếp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={grantForm.customExpiresAt}
                      onChange={(e) => setGrantForm((p) => ({ ...p, customExpiresAt: e.target.value }))}
                      className="w-full border border-[#c3c6d8] rounded-md py-2 px-3 text-sm bg-white outline-none focus:border-[#0f62fe] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Live Preview Card */}
              {previewNewExpiresDate && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between text-xs text-green-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-green-600">event_available</span>
                    <div>
                      <span className="font-semibold">Thời hạn mới dự kiến:</span>
                      <p className="font-bold text-sm text-green-900">{formatDate(previewNewExpiresDate)}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded font-bold uppercase text-[10px]">
                    {grantForm.planCode}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setGrantTarget(null)}
                  className="flex-1 py-2.5 bg-white border border-[#c3c6d8] rounded-md text-[#424656] text-sm font-semibold hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleGrant}
                  disabled={grantLoading}
                  className="flex-1 py-2.5 bg-[#0f62fe] text-white rounded-md text-sm font-semibold shadow-sm hover:bg-[#004ccd] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {grantLoading ? 'Đang xử lý...' : (grantTarget.isPremium ? 'Cập nhật Premium' : 'Cấp Premium')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumUserManager;
