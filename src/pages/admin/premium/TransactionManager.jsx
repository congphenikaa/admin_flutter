import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'success', label: 'Thành công' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS_STYLES = {
  success:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Thành công' },
  pending:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Chờ xử lý' },
  failed:    { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Thất bại' },
  cancelled: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Đã hủy' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmtCurrency = (n) =>
  n != null ? n.toLocaleString('vi-VN') + 'đ' : '—';

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-lg border border-[#e1e1ee] p-4 shadow-sm">
    <p className="text-xs text-[#737687] font-semibold mb-1">{label}</p>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

const Pagination = ({ page, totalPages, onPrev, onNext, onGo }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 2;
  const left  = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);
  if (left > 1)         { pages.push(1); if (left > 2) pages.push('…'); }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages) { if (right < totalPages - 1) pages.push('…'); pages.push(totalPages); }

  return (
    <div className="px-4 py-3 border-t border-[#e1e1ee] flex items-center justify-center gap-1 flex-wrap">
      <button
        onClick={onPrev} disabled={page === 1}
        className="px-3 py-1.5 border border-[#c3c6d8] rounded-md text-xs font-semibold text-[#424656] disabled:opacity-40 hover:bg-[#f2f3ff] transition-colors"
      >
        ‹ Trước
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#737687] text-xs select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onGo(p)}
            className={`w-8 h-8 rounded-md text-xs font-semibold border transition-colors ${
              p === page
                ? 'bg-[#0f62fe] text-white border-[#0f62fe]'
                : 'bg-white text-[#424656] border-[#c3c6d8] hover:bg-[#f2f3ff]'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={onNext} disabled={page === totalPages}
        className="px-3 py-1.5 border border-[#c3c6d8] rounded-md text-xs font-semibold text-[#424656] disabled:opacity-40 hover:bg-[#f2f3ff] transition-colors"
      >
        Sau ›
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const TransactionManager = () => {
  const { globalSearch } = useOutletContext();

  // ── State ────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [total, setTotal]               = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded]         = useState(null);
  const [page, setPage]                 = useState(1);

  // Stats được load riêng từ endpoint /stats — phản ánh TOÀN BỘ DB
  const [stats, setStats] = useState({
    totalRevenue: 0, successCount: 0, pendingCount: 0,
    failedCount: 0, cancelledCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Debounce search: không gọi API ngay khi user đang gõ
  const searchRef  = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Sync globalSearch vào searchQuery với debounce 400ms ─────────────────
  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setSearchQuery(globalSearch || '');
      setPage(1); // reset về trang 1 khi search
    }, 400);
    return () => clearTimeout(searchRef.current);
  }, [globalSearch]);

  // ── Fetch stats (1 lần khi mount, hoặc khi refresh) ─────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/admin/premium/transactions/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch {
      // Lỗi stats không critical — không toast
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch danh sách (có phân trang + search + filter) ───────────────────
  const fetchTransactions = useCallback(async (opts = {}) => {
    try {
      setLoading(true);
      const currentPage   = opts.page   ?? page;
      const currentStatus = opts.status ?? statusFilter;
      const currentSearch = opts.search ?? searchQuery;

      const res = await api.get('/admin/premium/transactions', {
        params: {
          status: currentStatus,
          search: currentSearch,
          page:   currentPage,
          limit:  PAGE_SIZE,
        },
      });

      if (res.data.success) {
        setTransactions(res.data.transactions || []);
        setTotal(res.data.total || 0);
      } else {
        toast.error(res.data.message || 'Không tải được danh sách');
      }
    } catch {
      toast.error('Không tải được lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    fetchTransactions({ page, status: statusFilter, search: searchQuery });
  }, [page, statusFilter, searchQuery]); // eslint-disable-line

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchStats();
    fetchTransactions({ page: 1, status: statusFilter, search: searchQuery });
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startRow   = (page - 1) * PAGE_SIZE + 1;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Lịch sử giao dịch</h1>
          <p className="text-sm text-[#737687]">Toàn bộ lịch sử thanh toán Premium của người dùng.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c3c6d8] rounded-md text-sm text-[#424656] hover:bg-[#f2f3ff] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Làm mới
        </button>
      </div>

      {/* Stats — từ endpoint /stats, phản ánh TOÀN BỘ DB */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatCard
          label="Tổng doanh thu"
          value={statsLoading ? '…' : fmtCurrency(stats.totalRevenue)}
          color="text-[#0f62fe]"
        />
        <StatCard
          label="Thành công"
          value={statsLoading ? '…' : stats.successCount}
          color="text-green-600"
        />
        <StatCard
          label="Chờ xử lý"
          value={statsLoading ? '…' : stats.pendingCount}
          color="text-blue-600"
        />
        <StatCard
          label="Thất bại"
          value={statsLoading ? '…' : stats.failedCount}
          color="text-red-500"
        />
        <StatCard
          label="Đã hủy"
          value={statsLoading ? '…' : stats.cancelledCount}
          color="text-orange-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
              statusFilter === f.value
                ? 'bg-[#0f62fe] text-white border-[#0f62fe]'
                : 'bg-white text-[#424656] border-[#c3c6d8] hover:bg-[#f2f3ff]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search hint */}
      {searchQuery && (
        <div className="mb-3 flex items-center gap-2 text-xs text-[#737687]">
          <span className="material-symbols-outlined text-[14px]">search</span>
          Kết quả tìm kiếm cho: <span className="font-semibold text-[#191b24]">"{searchQuery}"</span>
          — {total} giao dịch
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center gap-3 text-[#737687]">
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {['#', 'Người dùng', 'Gói', 'Số tiền', 'Mã giảm', 'Trạng thái', 'Ngày', ''].map((h, i) => (
                    <th
                      key={i}
                      className="bg-[#f2f3ff] text-[#424656] text-[11px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx, idx) => {
                    const user       = tx.userId;
                    const s          = STATUS_STYLES[tx.status] || STATUS_STYLES.pending;
                    const isExpanded = expanded === tx._id;
                    const rowNum     = startRow + idx;

                    return (
                      <React.Fragment key={tx._id}>
                        <tr
                          className="hover:bg-[#faf8ff] transition-colors cursor-pointer"
                          onClick={() => setExpanded(isExpanded ? null : tx._id)}
                        >
                          {/* # */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#737687] text-center w-10">
                            {rowNum}
                          </td>

                          {/* User */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee]">
                            <div className="flex items-center gap-2">
                              {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-[#e1e1ee]" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#f2f3ff] flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-[14px] text-[#737687]">person</span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-[#191b24] text-xs truncate max-w-[140px]">{user?.username ?? '—'}</p>
                                <p className="text-[10px] text-[#737687] truncate max-w-[140px]">{user?.email ?? '—'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee]">
                            <span className="px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#0f62fe] text-[10px] font-bold uppercase">
                              {tx.planCode}
                            </span>
                            <p className="text-[10px] text-[#737687] mt-0.5">{tx.durationDays} ngày</p>
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee]">
                            <p className="font-bold text-[#191b24] text-sm">{fmtCurrency(tx.finalAmount)}</p>
                            {tx.discountAmount > 0 && (
                              <p className="text-[10px] text-green-600">−{fmtCurrency(tx.discountAmount)}</p>
                            )}
                          </td>

                          {/* Coupon */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee] text-[11px] text-[#737687]">
                            {tx.couponCode || '—'}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee]">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
                              {s.label}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee] text-[11px] text-[#737687]">
                            {fmtDate(tx.createdAt)}
                          </td>

                          {/* Expand */}
                          <td className="py-3 px-4 border-b border-[#e1e1ee] text-center">
                            <span className={`material-symbols-outlined text-[16px] text-[#737687] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {isExpanded && (
                          <tr className="bg-[#faf8ff]">
                            <td colSpan={8} className="px-6 py-4 border-b border-[#e1e1ee]">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <p className="text-[10px] text-[#737687] font-semibold mb-0.5">Order ID</p>
                                  <p className="text-[#191b24] text-xs font-mono break-all">{tx.orderId}</p>
                                </div>
                                {tx.transId && (
                                  <div>
                                    <p className="text-[10px] text-[#737687] font-semibold mb-0.5">Trans ID</p>
                                    <p className="text-[#191b24] text-xs font-mono">{tx.transId}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-[10px] text-[#737687] font-semibold mb-0.5">Giá gốc</p>
                                  <p className="text-[#191b24] text-xs">{fmtCurrency(tx.originalAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-[#737687] font-semibold mb-0.5">Phương thức</p>
                                  <p className="text-[#191b24] text-xs uppercase">{tx.paymentMethod}</p>
                                </div>
                                {tx.premiumExpiresAt && (
                                  <div>
                                    <p className="text-[10px] text-[#737687] font-semibold mb-0.5">Premium hết hạn</p>
                                    <p className="text-[#191b24] text-xs">{fmtDate(tx.premiumExpiresAt)}</p>
                                  </div>
                                )}
                                {tx.note && (
                                  <div className="col-span-2">
                                    <p className="text-[10px] text-[#737687] font-semibold mb-0.5">Ghi chú</p>
                                    <p className="text-[#424656] text-xs">{tx.note}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-[#737687] text-sm">
                      {searchQuery ? `Không tìm thấy giao dịch nào cho "${searchQuery}".` : 'Không có giao dịch nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer: info + pagination */}
        {!loading && total > 0 && (
          <>
            <div className="px-4 pt-3 flex items-center justify-between">
              <p className="text-xs text-[#737687]">
                Hiển thị <span className="font-semibold text-[#191b24]">{startRow}–{Math.min(startRow + PAGE_SIZE - 1, total)}</span>
                {' '}/ <span className="font-semibold text-[#191b24]">{total}</span> giao dịch
              </p>
              <p className="text-xs text-[#737687]">
                Trang <span className="font-semibold text-[#191b24]">{page}</span> / {totalPages}
              </p>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              onGo={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionManager;
