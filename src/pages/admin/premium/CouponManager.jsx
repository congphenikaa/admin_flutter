import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const initialForm = {
  code: '',
  title: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minimumAmount: 0,
  maxDiscountAmount: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const CouponManager = () => {
  const { globalSearch } = useOutletContext();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/premium/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      } else {
        toast.error(res.data.message || 'Không tải được danh sách mã');
      }
    } catch (error) {
      toast.error('Không tải được danh sách mã');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openAdd = () => {
    setEditingCoupon(null);
    setForm(initialForm);
    setView('add');
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percent',
      discountValue: coupon.discountValue ?? '',
      minimumAmount: coupon.minimumAmount ?? 0,
      maxDiscountAmount: coupon.maxDiscountAmount ?? '',
      usageLimit: coupon.usageLimit ?? '',
      startDate: toDateInput(coupon.startDate),
      endDate: toDateInput(coupon.endDate),
      isActive: coupon.isActive !== false,
    });
    setView('edit');
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.code || !form.title || !form.discountValue) {
      toast.error('Vui lòng nhập mã, tên và giá trị giảm');
      return;
    }

    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minimumAmount: Number(form.minimumAmount) || 0,
        maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      };

      const response = editingCoupon
        ? await api.put(`/admin/premium/coupons/${editingCoupon._id}`, payload)
        : await api.post('/admin/premium/coupons', payload);

      if (response.data.success) {
        toast.success(editingCoupon ? 'Cập nhật mã thành công' : 'Thêm mã thành công');
        await fetchCoupons();
        setView('list');
      } else {
        toast.error(response.data.message || 'Thao tác thất bại');
      }
    } catch (error) {
      toast.error('Không lưu được mã giảm giá');
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Xóa mã ${coupon.code}?`)) return;

    try {
      const response = await api.delete(`/admin/premium/coupons/${coupon._id}`);
      if (response.data.success) {
        toast.success('Đã xóa mã');
        await fetchCoupons();
      } else {
        toast.error(response.data.message || 'Xóa thất bại');
      }
    } catch (error) {
      toast.error('Không xóa được mã');
    }
  };

  const filteredCoupons = useMemo(() => {
    const search = (globalSearch || '').toLowerCase();
    return (Array.isArray(coupons) ? coupons : []).filter((item) => {
      if (!search) return true;
      return [item.code, item.title, item.description, item.discountType]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(search));
    });
  }, [coupons, globalSearch]);

  return (
    <div className="w-full relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Quản lý mã giảm giá</h1>
          <p className="text-sm text-[#737687]">Thiết lập coupon dùng cho thanh toán Premium.</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm Mã
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#737687]">Đang tải danh sách mã...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] w-12 text-center">#</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Mã</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Giảm giá</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Giới hạn</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Trạng thái</th>
                  <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length > 0 ? filteredCoupons.map((coupon, index) => (
                  <tr key={coupon._id} className="hover:bg-[#faf8ff] transition-colors group">
                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#737687] font-medium text-center">{index + 1}</td>
                    <td className="py-3 px-4 border-b border-[#e1e1ee]">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-[#191b24] text-sm">{coupon.title}</p>
                        <p className="text-xs text-[#737687]">{coupon.code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#191b24] font-medium">
                      {coupon.discountType === 'fixed'
                        ? `${Number(coupon.discountValue || 0).toLocaleString('vi-VN')}đ`
                        : `${coupon.discountValue || 0}%`}
                    </td>
                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656]">
                      {coupon.usageLimit ? `${coupon.usedCount || 0}/${coupon.usageLimit}` : 'Không giới hạn'}
                    </td>
                    <td className="py-3 px-4 border-b border-[#e1e1ee]">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {coupon.isActive ? 'Hoạt động' : 'Tạm tắt'}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-right">
                      <div className="flex gap-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(coupon)} className="p-1.5 text-[#737687] hover:text-[#0f62fe] hover:bg-[#ecedfa] rounded transition-colors" title="Sửa">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(coupon)} className="p-1.5 text-[#737687] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors" title="Xóa">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="p-8 text-center text-[#737687] text-sm">Chưa có dữ liệu mã giảm giá.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(view === 'add' || view === 'edit') && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
          <div className="absolute inset-0" onClick={() => setView('list')}></div>
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl animate-[slideInRight_0.3s_ease-out] overflow-y-auto">
            <div className="p-6 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/50 shrink-0">
              <h2 className="text-xl font-bold text-[#191b24]">{view === 'add' ? 'Thêm Mã Giảm Giá' : 'Cập nhật Mã Giảm Giá'}</h2>
              <button onClick={() => setView('list')} className="text-[#737687] hover:bg-[#ecedfa] p-1.5 rounded-md transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Mã</label>
                  <input value={form.code} onChange={(e) => handleChange('code', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" placeholder="MOMO50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Tên mã</label>
                  <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" placeholder="Giảm nửa giá" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191b24] mb-2">Mô tả</label>
                <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows="3" className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" placeholder="Mô tả ngắn cho coupon" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Kiểu giảm</label>
                  <select value={form.discountType} onChange={(e) => handleChange('discountType', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe] bg-white">
                    <option value="percent">Phần trăm</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Giá trị giảm</label>
                  <input type="number" value={form.discountValue} onChange={(e) => handleChange('discountValue', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Giảm tối đa</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={(e) => handleChange('maxDiscountAmount', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Đơn tối thiểu</label>
                  <input type="number" value={form.minimumAmount} onChange={(e) => handleChange('minimumAmount', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Giới hạn lượt dùng</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => handleChange('usageLimit', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" />
                </div>
                <div className="flex items-center pt-7">
                  <label className="inline-flex items-center gap-2 text-sm text-[#424656]">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />
                    Hoạt động
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Ngày bắt đầu</label>
                  <input type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191b24] mb-2">Ngày kết thúc</label>
                  <input type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm outline-none focus:border-[#0f62fe]" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setView('list')} className="flex-1 py-2.5 bg-white border border-[#c3c6d8] rounded-md text-[#424656] text-sm font-semibold hover:bg-[#f2f3ff] transition-colors">Hủy</button>
                <button onClick={handleSubmit} className="flex-1 py-2.5 bg-[#0f62fe] text-white rounded-md text-sm font-semibold shadow-sm hover:bg-[#004ccd] transition-colors">{view === 'add' ? 'Thêm mã' : 'Lưu thay đổi'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;