import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    activeCreators: 0,
    totalTracks: 0,
    totalPlays: 0,
    totalRevenue: 0,
    pendingReview: 0,
    pendingArtistRequests: 0,
    totalStrikes: 0,
    totalPlaylists: 0,
    totalAlbums: 0,
    totalCategories: 0,
    activeAds: 0,
    activeCoupons: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [chartData, setChartData] = useState([]);
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/dashboard/stats?range=${timeRange}`);
        if (res.data.success) {
          const data = res.data.data;
          
          let pendingCount = 0;
          if (data.songsByStatus) {
            data.songsByStatus.forEach(statusGroup => {
              if (statusGroup._id === 'pending_review') pendingCount += statusGroup.count;
            });
          }

          setMetrics({
            totalUsers: data.totalUsers || 0,
            premiumUsers: data.premiumUsers || 0,
            activeCreators: data.totalArtists || 0,
            totalTracks: data.totalSongs || 0,
            totalPlays: data.totalPlays || 0,
            totalRevenue: data.totalRevenue || 0,
            pendingReview: pendingCount,
            pendingArtistRequests: data.pendingArtistRequests || 0,
            totalStrikes: data.totalStrikes || 0,
            totalPlaylists: data.totalPlaylists || 0,
            totalAlbums: data.totalAlbums || 0,
            totalCategories: data.totalCategories || 0,
            activeAds: data.activeAds || 0,
            activeCoupons: data.activeCoupons || 0,
          });

          if (data.chartData && data.chartData.length > 0) {
              setChartData(data.chartData);
          } else {
              setChartData([]);
          }
          
          if (data.topSongs) {
              setTopSongs(data.topSongs);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Admin Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const conversionRate = metrics.totalUsers > 0 
    ? ((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(1) 
    : 0;

  return (
    <div className="w-full pb-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b24] mb-1">Platform Overview</h1>
          <p className="text-sm text-[#737687]">Real-time comprehensive metrics and system status.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-[#c3c6d8] rounded-md text-sm font-semibold text-[#424656] hover:bg-[#f2f3ff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f62fe]"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f62fe]"></div>
        </div>
      ) : (
        <>
          {/* HIGH LEVEL METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-[#0f62fe] to-[#004ccd] p-5 rounded-xl shadow-md text-white flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                  <span className="material-symbols-outlined">payments</span>
                </div>
              </div>
              <h3 className="text-white/80 text-sm font-semibold mb-1 relative z-10">Total Revenue</h3>
              <div className="text-3xl font-black relative z-10">{formatCurrency(metrics.totalRevenue)}</div>
            </div>

            {/* Total Users & Premium */}
            <div className="bg-white p-5 rounded-xl border border-[#e1e1ee] shadow-sm flex flex-col relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#0f62fe]">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-[#006e2d] bg-[#e6f4ea] px-2 py-1 rounded-md border border-[#b7dfc9] inline-block">
                        {conversionRate}% Premium
                    </div>
                </div>
              </div>
              <h3 className="text-[#737687] text-sm font-semibold mb-1">Total Users</h3>
              <div className="flex items-end gap-2">
                  <div className="text-3xl font-black text-[#191b24]">{metrics.totalUsers.toLocaleString()}</div>
                  <div className="text-sm font-semibold text-[#737687] mb-1">/ {metrics.premiumUsers.toLocaleString()} VIP</div>
              </div>
            </div>

            {/* Total Plays */}
            <div className="bg-white p-5 rounded-xl border border-[#e1e1ee] shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#fdf4ff] flex items-center justify-center text-[#c026d3]">
                  <span className="material-symbols-outlined">headphones</span>
                </div>
              </div>
              <h3 className="text-[#737687] text-sm font-semibold mb-1">Total Streams</h3>
              <div className="text-3xl font-black text-[#191b24]">{metrics.totalPlays.toLocaleString()}</div>
            </div>

            {/* Active Ads */}
            <div className="bg-white p-5 rounded-xl border border-[#e1e1ee] shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#fff7ed] flex items-center justify-center text-[#ea580c]">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
              </div>
              <h3 className="text-[#737687] text-sm font-semibold mb-1">Active Advertisements</h3>
              <div className="text-3xl font-black text-[#191b24]">{metrics.activeAds.toLocaleString()}</div>
            </div>
          </div>

          {/* ACTION NEEDED & CONTENT OVERVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Action Needed */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border-t-4 border-t-[#ba1a1a] border-x border-b border-[#e1e1ee] p-5 flex flex-col">
                <h3 className="font-bold text-[#ba1a1a] flex items-center gap-2 mb-4 uppercase tracking-wider text-sm">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    Action Needed
                </h3>
                <div className="space-y-3 flex-1">
                    <Link to="/admin/moderation" className="flex items-center justify-between p-3 rounded-lg bg-[#ffdad6]/30 border border-[#ffb4ab] hover:bg-[#ffdad6]/60 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px]">music_note</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-[#191b24] group-hover:text-[#ba1a1a] transition-colors">Pending Songs</div>
                                <div className="text-xs text-[#737687]">Require moderation</div>
                            </div>
                        </div>
                        <div className="text-lg font-black text-[#ba1a1a]">{metrics.pendingReview}</div>
                    </Link>

                    <Link to="/admin/users" className="flex items-center justify-between p-3 rounded-lg bg-[#fff8e1] border border-[#ffe082] hover:bg-[#ffecb3] transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#f57f17] text-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-[#191b24] group-hover:text-[#f57f17] transition-colors">Artist Requests</div>
                                <div className="text-xs text-[#737687]">Upgrade requests</div>
                            </div>
                        </div>
                        <div className="text-lg font-black text-[#f57f17]">{metrics.pendingArtistRequests}</div>
                    </Link>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#f3e5f5] border border-[#ce93d8] hover:bg-[#e1bee7] transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#8e24aa] text-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px]">gavel</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-[#191b24] group-hover:text-[#8e24aa] transition-colors">Copyright Strikes</div>
                                <div className="text-xs text-[#737687]">Active strikes</div>
                            </div>
                        </div>
                        <div className="text-lg font-black text-[#8e24aa]">{metrics.totalStrikes}</div>
                    </div>
                </div>
            </div>

            {/* Content Overview */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#e1e1ee] p-5">
                <h3 className="font-bold text-[#191b24] mb-4 text-base">Content Catalog</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-[calc(100%-2rem)]">
                    <div className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col justify-center items-center text-center border border-[#e9ecef]">
                        <span className="material-symbols-outlined text-[#0f62fe] text-3xl mb-2">album</span>
                        <div className="text-2xl font-bold text-[#191b24] mb-1">{metrics.totalAlbums}</div>
                        <div className="text-xs font-semibold text-[#737687] uppercase tracking-wide">Albums</div>
                    </div>
                    <div className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col justify-center items-center text-center border border-[#e9ecef]">
                        <span className="material-symbols-outlined text-[#0f62fe] text-3xl mb-2">queue_music</span>
                        <div className="text-2xl font-bold text-[#191b24] mb-1">{metrics.totalPlaylists}</div>
                        <div className="text-xs font-semibold text-[#737687] uppercase tracking-wide">Playlists</div>
                    </div>
                    <div className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col justify-center items-center text-center border border-[#e9ecef]">
                        <span className="material-symbols-outlined text-[#0f62fe] text-3xl mb-2">category</span>
                        <div className="text-2xl font-bold text-[#191b24] mb-1">{metrics.totalCategories}</div>
                        <div className="text-xs font-semibold text-[#737687] uppercase tracking-wide">Categories</div>
                    </div>
                    <div className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col justify-center items-center text-center border border-[#e9ecef]">
                        <span className="material-symbols-outlined text-[#0f62fe] text-3xl mb-2">local_offer</span>
                        <div className="text-2xl font-bold text-[#191b24] mb-1">{metrics.activeCoupons}</div>
                        <div className="text-xs font-semibold text-[#737687] uppercase tracking-wide">Coupons</div>
                    </div>
                </div>
            </div>

          </div>

          {/* CHARTS ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white border border-[#e1e1ee] rounded-xl shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/30">
                    <div>
                        <h4 className="font-bold text-[#191b24] text-base">Revenue Growth</h4>
                        <p className="text-xs text-[#737687] mt-0.5">Daily revenue in the last {timeRange} days</p>
                    </div>
                </div>
                <div className="p-6 w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e1ee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `₫${(val/1000)}k`} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e1e1ee', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value)} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0f62fe" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white border border-[#e1e1ee] rounded-xl shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/30">
                    <div>
                        <h4 className="font-bold text-[#191b24] text-base">User Registration</h4>
                        <p className="text-xs text-[#737687] mt-0.5">New users joining the platform</p>
                    </div>
                </div>
                <div className="p-6 w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e1ee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e1e1ee' }} />
                            <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#16a34a' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>

          {/* CHARTS ROW 2 & TOP CONTENT */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Content Moderation Chart */}
            <div className="xl:col-span-2 bg-white border border-[#e1e1ee] rounded-xl shadow-sm flex flex-col min-h-[420px] overflow-hidden">
              <div className="p-5 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/30">
                <div>
                  <h4 className="font-bold text-[#191b24] text-base">Uploads vs. Pending Reviews</h4>
                  <p className="text-xs text-[#737687] mt-0.5">Track volume compared to content requiring moderation</p>
                </div>
              </div>

              <div className="p-6 flex-1 w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e1ee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737687', fontSize: 12, fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e1e1ee', fontWeight: 600 }} itemStyle={{ fontWeight: 700 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }} />
                    <Bar dataKey="uploads" name="Total Uploads" fill="#b4c5ff" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Line type="monotone" dataKey="pending" name="Pending Review" stroke="#ba1a1a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#ba1a1a' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Content */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e1e1ee] flex flex-col h-full">
              <div className="p-5 border-b border-[#e1e1ee] bg-[#f2f3ff]/30 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#191b24] text-base">Top Trending Songs</h4>
                  <p className="text-xs text-[#737687] mt-0.5">Most streamed content</p>
                </div>
                <span className="material-symbols-outlined text-[#0f62fe]">trending_up</span>
              </div>
              <div className="p-0 flex-1 flex flex-col overflow-y-auto">
                {topSongs.length > 0 ? (
                    <ul className="divide-y divide-[#e1e1ee]">
                        {topSongs.map((song, idx) => (
                            <li key={song._id} className="p-4 hover:bg-[#f8f9fa] transition-colors flex items-center gap-3">
                                <div className="text-lg font-black text-[#c3c6d8] w-6 text-center">{idx + 1}</div>
                                <img src={song.imageUrl} alt={song.title} className="w-12 h-12 rounded-md object-cover shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-[#191b24] truncate">{song.title}</div>
                                    <div className="text-xs text-[#737687] truncate">{song.artist?.name || 'Unknown Artist'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-[#0f62fe]">{song.plays.toLocaleString()}</div>
                                    <div className="text-[10px] text-[#737687] uppercase">Plays</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 text-center text-[#737687] text-sm flex-1 flex items-center justify-center">
                        Không có dữ liệu bài hát.
                    </div>
                )}
              </div>
              <div className="p-4 border-t border-[#e1e1ee] bg-[#faf8ff] text-center">
                <Link to="/admin/songs" className="text-sm font-bold text-[#0f62fe] hover:underline">
                    View All Songs
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
