import React, { useState, useEffect } from 'react';
import ModerationReviewModal from './ModerationReviewModal';
import api from '../../../utils/api';

const ModerationManager = () => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/moderation/queue');
      if (res.data.success) {
        const mappedData = res.data.songs.map(song => ({
          _id: song._id,
          id: `TRK-${song._id.substring(0, 5).toUpperCase()}`,
          title: song.title,
          artist: song.artist ? song.artist.name : 'Unknown Artist',
          aiScore: song.aiSimilarityScore || 0,
          originalTrack: song.aiMatchedSong || 'Unknown Source',
          timeFlagged: new Date(song.createdAt).toLocaleString(),
          status: song.aiSimilarityScore >= 80 ? 'Critical' : 'Warning',
          // THÊM 2 DÒNG NÀY VÀO ĐỂ MODAL NHẬN ĐƯỢC LINK NHẠC/ẢNH
          audioUrl: song.audioUrl, 
          imageUrl: song.imageUrl, 
          aiMatches: song.aiMatches || [],
          rawSong: song
        }));
        setQueueData(mappedData);
      }
    } catch (error) {
      console.error("Lỗi tải hàng đợi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191b24] mb-1">Moderation Queue</h1>
          <p className="text-sm text-[#737687]">Review and resolve AI-flagged audio submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#c3c6d8] rounded-md text-sm font-semibold text-[#424656] hover:bg-[#f2f3ff] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filters
          </button>
          <button className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Auto-Resolve Low Risk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="p-5 bg-white border border-[#c3c6d8] rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#737687]">Pending Reviews</p>
          <h3 className="text-3xl font-black text-[#191b24] mt-1">{queueData.length}</h3>
          <div className="flex items-center gap-1 text-[#006e2d] text-xs mt-2 font-bold">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            <span>-4% from yesterday</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-[#c3c6d8] rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#737687]">Critical Matches (&gt;80%)</p>
          <h3 className="text-3xl font-black text-[#ba1a1a] mt-1">{queueData.filter((item) => item.aiScore >= 80).length}</h3>
          <div className="flex items-center gap-1 text-[#ba1a1a] text-xs mt-2 font-bold">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>High priority</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-[#c3c6d8] rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#737687]">Avg Resolution Time</p>
          <h3 className="text-3xl font-black text-[#191b24] mt-1">4.2h</h3>
          <div className="flex items-center gap-1 text-[#737687] text-xs mt-2 font-bold">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span>On target</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e1e1ee] shadow-sm overflow-hidden mt-8">
        <div className="p-4 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/30">
          <h2 className="font-bold text-[#191b24]">Flagged Submissions (Thực tế)</h2>
          <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-xs font-bold px-2.5 py-1 rounded border border-[#ba1a1a]/20">
            {queueData.length} Action Needed
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="bg-white text-[#737687] text-xs font-semibold uppercase tracking-wider py-3 px-5 border-b border-[#e1e1ee]">ID / Timestamp</th>
                <th className="bg-white text-[#737687] text-xs font-semibold uppercase tracking-wider py-3 px-5 border-b border-[#e1e1ee]">Track & Artist</th>
                <th className="bg-white text-[#737687] text-xs font-semibold uppercase tracking-wider py-3 px-5 border-b border-[#e1e1ee]">Suspected Match</th>
                <th className="bg-white text-[#737687] text-xs font-semibold uppercase tracking-wider py-3 px-5 border-b border-[#e1e1ee]">AI Score</th>
                <th className="bg-white text-[#737687] text-xs font-semibold uppercase tracking-wider py-3 px-5 border-b border-[#e1e1ee] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5" className="p-5 text-center text-[#737687]">Đang tải danh sách chờ duyệt...</td></tr>
              ) : queueData.length === 0 ? (
                 <tr><td colSpan="5" className="p-5 text-center text-[#006e2d] font-bold">Hệ thống sạch! Không có bài hát nào vi phạm.</td></tr>
              ) : queueData.map((item) => (
                <tr key={item._id} className="hover:bg-[#faf8ff] transition-colors group">
                  <td className="py-4 px-5 border-b border-[#e1e1ee]">
                    <p className="font-mono text-sm text-[#191b24] font-medium">{item.id}</p>
                    <p className="text-xs text-[#737687] mt-0.5">{item.timeFlagged}</p>
                  </td>
                  <td className="py-4 px-5 border-b border-[#e1e1ee]">
                    <p className="font-bold text-[#191b24] text-sm">{item.title}</p>
                    <p className="text-xs text-[#0f62fe] font-medium mt-0.5">{item.artist}</p>
                  </td>
                  <td className="py-4 px-5 border-b border-[#e1e1ee]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#737687]">copyright</span>
                      <span className="text-sm text-[#424656]">{item.originalTrack}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 border-b border-[#e1e1ee]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#e1e1ee] rounded-full overflow-hidden w-24">
                        <div
                          className={`h-full rounded-full ${item.aiScore >= 80 ? 'bg-[#ba1a1a]' : 'bg-[#c84000]'}`}
                          style={{ width: `${item.aiScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${item.aiScore >= 80 ? 'text-[#ba1a1a]' : 'text-[#c84000]'}`}>
                        {item.aiScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 border-b border-[#e1e1ee] text-right">
                    <button
                      onClick={() => setSelectedReview(item)}
                      className="px-4 py-2 bg-white border border-[#c3c6d8] text-[#191b24] text-sm font-semibold rounded-md hover:bg-[#f2f3ff] hover:text-[#0f62fe] hover:border-[#0f62fe] transition-all shadow-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReview && (
        <ModerationReviewModal
          data={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSuccess={fetchQueue}
        />
      )}
    </div>
  );
};

export default ModerationManager;