import React, { useState, useEffect } from 'react';
import UploadTrack from './UploadTrack';
import api from '../../../utils/api';

const ContentManager = () => {
  const [view, setView] = useState('list');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy dữ liệu từ Backend khi component được mount
  useEffect(() => {
    fetchMySongs();
  }, [view]); // Mỗi khi từ trang Upload quay lại list, sẽ tự động fetch lại data mới

  const fetchMySongs = async () => {
    try {
        setLoading(true);
        const response = await api.get('/artist/my-songs');
        if (response.data.success) {
            setTracks(response.data.songs);
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải danh sách bài hát');
    } finally {
        setLoading(false);
    }
  };

  if (view === 'add') {
    return <UploadTrack setView={setView} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">My Tracks</h1>
          <p className="text-[#a1a1aa] text-lg">Manage your discography and track performance.</p>
        </div>
        <button
          onClick={() => setView('add')}
          className="bg-[#53e076] text-[#003914] px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(83,224,118,0.2)] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
          Upload New Track
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
            {error}
        </div>
      )}

      {/* Track List Table */}
      <div className="bg-[#1c1b1b] border border-white/5 rounded-2xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider py-4 px-6 w-12 text-center">#</th>
                <th className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider py-4 px-6">Track Detail</th>
                <th className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider py-4 px-6">Status</th>
                <th className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider py-4 px-6 text-right">Streams</th>
                <th className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider py-4 px-6 text-right w-32">Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                    <td colSpan="5" className="py-8 text-center text-[#a1a1aa]">Đang tải dữ liệu...</td>
                </tr>
              ) : tracks.length === 0 ? (
                <tr>
                    <td colSpan="5" className="py-8 text-center text-[#a1a1aa]">Bạn chưa tải lên bài hát nào.</td>
                </tr>
              ) : (
                tracks.map((track, index) => (
                    <tr key={track._id} className="hover:bg-[#2a2a2a]/50 transition-colors group border-b border-white/5 last:border-0 cursor-pointer">
                    <td className="py-4 px-6 text-center">
                        <span className="text-[#a1a1aa] font-medium group-hover:hidden">{index + 1}</span>
                        <span className="material-symbols-outlined text-[#53e076] hidden group-hover:block" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </td>
                    <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#2a2a2a] rounded overflow-hidden shadow-md flex-shrink-0">
                            {/* Nếu bị AI block thì hiện ảnh mặc định */}
                            <img src={track.imageUrl === 'blocked_by_ai' ? 'https://via.placeholder.com/150/000000/FFFFFF/?text=Blocked' : track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base mb-0.5 group-hover:text-[#53e076] transition-colors">{track.title}</p>
                            <p className="text-[#a1a1aa] text-xs">{new Date(track.createdAt).toLocaleDateString()}</p>
                        </div>
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        {track.status === 'live' && <span className="px-2.5 py-1 rounded bg-[#53e076]/10 text-[#53e076] text-[10px] font-black uppercase tracking-wider border border-[#53e076]/20">Live</span>}
                        {/* pending_ai và flagged hiển thị chung màu cam */}
                        {(track.status === 'pending_ai' || track.status === 'flagged') && <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/20">Pending Review</span>}
                        {track.status === 'rejected' && <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/20">Rejected</span>}
                        
                        {/* Hiển thị điểm AI nếu có */}
                        {track.aiSimilarityScore > 0 && (
                             <span className="ml-2 text-[10px] text-[#a1a1aa]">AI Match: {track.aiSimilarityScore}%</span>
                        )}
                    </td>
                    <td className="py-4 px-6 text-right text-white font-medium">
                        {track.plays}
                    </td>
                    <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center gap-4 text-[#a1a1aa] group-hover:text-white transition-colors">
                        <span className="text-sm">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                        <button className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">more_horiz</button>
                        </div>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;