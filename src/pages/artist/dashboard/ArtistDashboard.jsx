import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

const ArtistDashboard = () => {
  const [stats, setStats] = useState({
    totalStreams: 0,
    totalTracks: 0,
    totalAlbums: 0,
    followers: 0,
    recentUploads: []
  });
  const [loading, setLoading] = useState(true);

  // MOCK DATA cho biểu đồ (Vì DB hiện tại chưa lưu log theo ngày)
  const chartData = [
    { day: 'Mon', value: 75, active: false },
    { day: 'Tue', value: 50, active: false },
    { day: 'Wed', value: 66, active: false },
    { day: 'Thu', value: 95, active: true },
    { day: 'Fri', value: 80, active: false },
    { day: 'Sat', value: 66, active: false },
    { day: 'Sun', value: 75, active: false },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/artist/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hàm tính thời gian hiển thị (vd: "Released 2 days ago")
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Uploaded today';
    if (diffDays < 30) return `Uploaded ${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="p-8 text-center text-[#a1a1aa] animate-pulse font-bold mt-20">Đang tải dữ liệu Studio...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-[fadeIn_0.3s_ease-out]">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Welcome back, Artist</h1>
        <p className="text-[#a1a1aa] text-lg">Here's what's happening with your studio today.</p>
      </header>

      {/* Metrics Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1: Total Streams */}
        <div className="bg-[#1c1b1b] border border-white/5 p-6 rounded-2xl hover:bg-[#2a2a2a] transition-all group">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 rounded-lg bg-[#53e076]/10 text-[#53e076]">
              <span className="material-symbols-outlined">equalizer</span>
            </span>
            <span className="text-[#53e076] text-xs font-bold">Live</span>
          </div>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-1">Total Streams</p>
          <p className="text-white text-3xl font-bold">{stats.totalStreams.toLocaleString()}</p>
        </div>

        {/* Card 2: Total Tracks */}
        <div className="bg-[#1c1b1b] border border-white/5 p-6 rounded-2xl hover:bg-[#2a2a2a] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 rounded-lg bg-[#53e076]/10 text-[#53e076]">
              <span className="material-symbols-outlined">library_music</span>
            </span>
          </div>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-1">Total Tracks</p>
          <p className="text-white text-3xl font-bold">{stats.totalTracks.toLocaleString()}</p>
        </div>

        {/* Card 3: Albums & EPs */}
        <div className="bg-[#1c1b1b] border border-white/5 p-6 rounded-2xl hover:bg-[#2a2a2a] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 rounded-lg bg-[#53e076]/10 text-[#53e076]">
              <span className="material-symbols-outlined">album</span>
            </span>
          </div>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-1">Albums Published</p>
          <p className="text-white text-3xl font-bold">{stats.totalAlbums.toLocaleString()}</p>
        </div>

        {/* Card 4: Followers */}
        <div className="bg-[#1c1b1b] border border-white/5 p-6 rounded-2xl hover:bg-[#2a2a2a] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 rounded-lg bg-[#53e076]/10 text-[#53e076]">
              <span className="material-symbols-outlined">person_add</span>
            </span>
          </div>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-1">Followers</p>
          <p className="text-white text-3xl font-bold">{stats.followers.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Analytics and Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area (Span 2) */}
        <div className="lg:col-span-2 bg-[#1c1b1b] border border-white/5 rounded-2xl p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-1">Streams over the last 7 days</h3>
              <p className="text-[#a1a1aa] text-sm">Real-time performance distribution (Demo)</p>
            </div>
          </div>

          {/* Asymmetric HTML/CSS Bar Chart */}
          <div className="h-[300px] w-full flex flex-col justify-end mt-auto">
            <div className="flex-1 w-full relative flex items-end gap-2 px-2">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className={`flex-1 rounded-t-lg relative group overflow-hidden ${item.active ? 'bg-[#53e076] shadow-[0_0_20px_rgba(83,224,118,0.3)]' : 'bg-[#2a2a2a]'}`}
                  style={{ height: `${item.value}%` }}
                >
                  {item.active && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#003914] text-[#53e076] text-[10px] font-black px-2 py-1 rounded">PEAK</div>
                  )}
                  {!item.active && (
                    <div className="absolute inset-0 w-full h-full bg-[#53e076]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </div>
              ))}
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4 px-2">
              {chartData.map((item, index) => (
                <span key={index} className={`w-full text-center text-[10px] font-bold uppercase tracking-widest ${item.active ? 'text-[#53e076] font-black' : 'text-[#a1a1aa]'}`}>
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right-side Recent Uploads Panel (Span 1) */}
        <div className="lg:col-span-1 bg-[#1c1b1b] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-white text-lg font-bold">Recent Uploads</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {stats.recentUploads.length === 0 ? (
               <p className="text-center text-[#737373] p-8 text-sm">Chưa có bài hát nào được tải lên.</p>
            ) : (
                stats.recentUploads.map((item, index) => (
                <div key={item._id} className={`p-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer group ${index > 0 ? 'border-t border-white/5' : ''}`}>
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-lg bg-[#2a2a2a]">
                    <img src={item.imageUrl === 'blocked_by_ai' ? 'https://via.placeholder.com/150/000000/FFFFFF/?text=Blocked' : item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{item.title}</p>
                    <p className="text-[#a1a1aa] text-xs mt-0.5">{getTimeAgo(item.createdAt)}</p>
                    </div>
                    <div className="text-right">
                    <p className={`text-[10px] font-black uppercase mb-0.5
                        ${item.status === 'live' ? 'text-[#53e076]' :
                        item.status === 'rejected' ? 'text-red-400' : 'text-orange-400'}`}
                    >
                        {item.status.replace('_', ' ')}
                    </p>
                    <p className="text-[#a1a1aa] text-[10px] font-medium">{item.plays.toLocaleString()} plays</p>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;