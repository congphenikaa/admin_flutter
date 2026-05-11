import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalTracks: 0,
    trackGrowth: 12,
    pendingReview: 0,
    activeCreators: 0,
    creatorGrowth: 5.2,
    rejectionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const [chartData] = useState([
    { name: 'Mon', uploads: 400, violations: 24 },
    { name: 'Tue', uploads: 300, violations: 13 },
    { name: 'Wed', uploads: 200, violations: 98 },
    { name: 'Thu', uploads: 278, violations: 39 },
    { name: 'Fri', uploads: 189, violations: 48 },
    { name: 'Sat', uploads: 239, violations: 38 },
    { name: 'Sun', uploads: 349, violations: 43 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard/stats');
        if (res.data.success) {
          const { totalSongs, totalArtists, songsByStatus } = res.data.data;

          let pendingCount = 0;
          let rejectedCount = 0;
          songsByStatus.forEach(statusGroup => {
            if (statusGroup._id === 'flagged' || statusGroup._id === 'pending_ai') pendingCount += statusGroup.count;
            if (statusGroup._id === 'rejected') rejectedCount += statusGroup.count;
          });

          const rejectionRate = totalSongs > 0 ? ((rejectedCount / totalSongs) * 100).toFixed(1) : 0;

          setMetrics(prev => ({
            ...prev,
            totalTracks: totalSongs,
            activeCreators: totalArtists,
            pendingReview: pendingCount,
            rejectionRate: rejectionRate
          }));
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Admin Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b24] mb-1">Platform Overview</h1>
          <p className="text-sm text-[#737687]">Real-time metrics and system status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#c3c6d8] rounded-md text-sm font-semibold text-[#424656] hover:bg-[#f2f3ff] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Last 7 Days
          </button>
          <button className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#737687]">Đang tải dữ liệu hệ thống...</p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-[#e1e1ee] shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#0f62fe]">
              <span className="material-symbols-outlined">queue_music</span>
            </div>
          </div>
          <h3 className="text-[#737687] text-sm font-semibold mb-1">Total Tracks</h3>
          <div className="text-3xl font-black text-[#191b24]">{metrics.totalTracks.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border-t-4 border-t-[#ba1a1a] border-x border-b border-[#e1e1ee] shadow-md flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#ba1a1a]/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <span className="flex items-center text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-1 rounded-md border border-[#ffb4ab] uppercase tracking-wider">
              Action Needed
            </span>
          </div>
          <h3 className="text-[#737687] text-sm font-semibold mb-1 relative z-10">Pending AI Review</h3>
          <div className="text-3xl font-black text-[#ba1a1a] relative z-10">{metrics.pendingReview}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e1e1ee] shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#0f62fe]">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <h3 className="text-[#737687] text-sm font-semibold mb-1">Active Creators</h3>
          <div className="text-3xl font-black text-[#191b24]">{metrics.activeCreators.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e1e1ee] shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#0f62fe]">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <span className="flex items-center text-xs font-bold text-[#424656] bg-[#e7e7f4] px-2 py-1 rounded-md border border-[#c3c6d8]">
              Auto-handled
            </span>
          </div>
          <h3 className="text-[#737687] text-sm font-semibold mb-1">AI Rejection Rate</h3>
          <div className="text-3xl font-black text-[#191b24]">{metrics.rejectionRate}%</div>
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-[#e1e1ee] rounded-xl shadow-sm flex flex-col min-h-[420px] overflow-hidden">
          <div className="p-5 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/30">
            <div>
              <h4 className="font-bold text-[#191b24] text-base">Uploads vs. Violations</h4>
              <p className="text-xs text-[#737687] mt-0.5">Track volume compared to flagged content (Last 7 Days)</p>
            </div>
            <button className="p-1.5 text-[#737687] hover:bg-[#ecedfa] hover:text-[#0f62fe] rounded-md transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          <div className="p-6 flex-1 w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e1ee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e1e1ee', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontWeight: 600 }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }} />
                <Bar dataKey="uploads" name="Total Uploads" fill="#b4c5ff" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Line type="monotone" dataKey="violations" name="Flagged by AI" stroke="#ba1a1a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#ba1a1a' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e1e1ee] flex flex-col h-full">
          <div className="p-5 border-b border-[#e1e1ee] bg-[#f2f3ff]/30">
            <h4 className="font-bold text-[#191b24] text-base">System Health</h4>
            <p className="text-xs text-[#737687] mt-0.5">Real-time infrastructure status</p>
          </div>
          <div className="p-6 space-y-6 flex-1 flex flex-col">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-[#424656] text-xs uppercase tracking-wider">AI Audio Engine</span>
                <span className="text-[#006e2d] font-bold text-xs bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#b7dfc9]">Optimal</span>
              </div>
              <div className="w-full bg-[#e7e7f4] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006e2d] h-full w-[94%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-[#424656] text-xs uppercase tracking-wider">Metadata Cluster</span>
                <span className="text-[#006e2d] font-bold text-xs bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#b7dfc9]">Optimal</span>
              </div>
              <div className="w-full bg-[#e7e7f4] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006e2d] h-full w-[91%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-[#424656] text-xs uppercase tracking-wider">Copyright DB Sync</span>
                <span className="text-[#c84000] font-bold text-xs bg-[#fff1ed] px-2 py-0.5 rounded border border-[#ffdbd0]">Latency: 240ms</span>
              </div>
              <div className="w-full bg-[#e7e7f4] h-2 rounded-full overflow-hidden">
                <div className="bg-[#c84000] h-full w-[45%] rounded-full"></div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="p-4 rounded-lg bg-[#faf8ff] border border-[#c3c6d8] border-dashed text-center">
                <span className="material-symbols-outlined text-[#0f62fe] text-[24px] mb-1">dns</span>
                <p className="text-xs text-[#424656] font-semibold mb-3">All systems operational. Last checked 2 mins ago.</p>
                <button className="w-full py-2 bg-white border border-[#c3c6d8] rounded-md text-[#0f62fe] text-xs font-bold hover:bg-[#f2f3ff] transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Run Diagnostics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
