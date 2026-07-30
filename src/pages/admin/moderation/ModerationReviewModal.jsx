import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import api from '../../../utils/api';

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

const ModerationReviewModal = ({ data, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Tham chiếu DOM & Wavesurfer Instances
  const userWaveRef = useRef(null);
  const userSpecRef = useRef(null);
  const origWaveRef = useRef(null);
  const origSpecRef = useRef(null);
  const [userWs, setUserWs] = useState(null);
  const [origWs, setOrigWs] = useState(null);

  // States UI
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingOrig, setIsPlayingOrig] = useState(false);
  const [userTime, setUserTime] = useState('00:00');
  const [origTime, setOrigTime] = useState('00:00');

  const aiMatches = data?.aiMatches && data.aiMatches.length > 0 
    ? data.aiMatches 
    : [{ start: data?.matchStart ?? 0.0, end: data?.matchEnd ?? 5.0, score: data?.aiScore }];

  useEffect(() => {
    if (!data) return;

    let wsUser = null;

    if (data.audioUrl && data.audioUrl !== 'blocked_by_ai') {
      wsUser = WaveSurfer.create({
        container: userWaveRef.current,
        waveColor: '#b4c5ff',
        progressColor: '#0f62fe',
        cursorColor: '#004ccd',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 40,
        normalize: true,
      });

      const wsUserRegions = wsUser.registerPlugin(RegionsPlugin.create());
      wsUser.registerPlugin(
        SpectrogramPlugin.create({
          container: userSpecRef.current,
          labels: true,
          height: 60,
        })
      );
      wsUser.load(data.audioUrl);

      wsUser.on('decode', () => {
        aiMatches.forEach(match => {
          wsUserRegions.addRegion({
            // Dùng query_start/query_end (thời gian trên file upload)
            start: match.query_start ?? match.start,
            end: match.query_end ?? match.end,
            color: 'rgba(186, 26, 26, 0.25)',
            drag: false,
            resize: false,
          });
        });
      });

      wsUser.on('audioprocess', () => setUserTime(formatTime(wsUser.getCurrentTime())));
      wsUser.on('finish', () => setIsPlayingUser(false));
      setUserWs(wsUser);
    }

    const wsOrig = WaveSurfer.create({
      container: origWaveRef.current,
      waveColor: '#ffb4ab',
      progressColor: '#ba1a1a',
      cursorColor: '#93000a',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 40,
      normalize: true,
    });

    const wsOrigRegions = wsOrig.registerPlugin(RegionsPlugin.create());
    wsOrig.registerPlugin(
      SpectrogramPlugin.create({
        container: origSpecRef.current,
        labels: true,
        height: 60,
      })
    );

    const originalAudioLink = `${R2_PUBLIC_URL}/${data.originalTrack}`;
    wsOrig.load(originalAudioLink);

    wsOrig.on('decode', () => {
      aiMatches.forEach(match => {
        wsOrigRegions.addRegion({
          // Dùng original_start/original_end (thời gian trên bài gốc từ R2)
          start: match.original_start ?? match.start,
          end: match.original_end ?? match.end,
          color: 'rgba(186, 26, 26, 0.25)', 
          drag: false,
          resize: false,
        });
      });
    });

    wsOrig.on('audioprocess', () => setOrigTime(formatTime(wsOrig.getCurrentTime())));
    wsOrig.on('finish', () => setIsPlayingOrig(false));
    setOrigWs(wsOrig);

    return () => {
      if (wsUser) wsUser.destroy();
      if (wsOrig) wsOrig.destroy();
    };
  }, [data]);

  // Các hàm điều khiển Player
  const handlePlayUser = () => {
    if (origWs && isPlayingOrig) { origWs.pause(); setIsPlayingOrig(false); }
    if (userWs) { userWs.playPause(); setIsPlayingUser(!isPlayingUser); }
  };

  const handlePlayOrig = () => {
    if (userWs && isPlayingUser) { userWs.pause(); setIsPlayingUser(false); }
    if (origWs) { origWs.playPause(); setIsPlayingOrig(!isPlayingOrig); }
  };

  const jumpToMatch = () => {
    if (!aiMatches || aiMatches.length === 0) return;
    const firstMatch = aiMatches[0];
    // Nhạc gốc (origWs) nhảy về original_start của bài gốc
    const origJumpTo = firstMatch.original_start ?? firstMatch.start;
    // File upload (userWs) nhảy về query_start của bản upload
    const userJumpTo = firstMatch.query_start ?? firstMatch.start;
    if (origWs) {
      origWs.pause(); setIsPlayingOrig(false);
      origWs.setTime(origJumpTo);
      setOrigTime(formatTime(origJumpTo));
    }
    if (userWs) {
      userWs.pause(); setIsPlayingUser(false);
      userWs.setTime(userJumpTo);
      setUserTime(formatTime(userJumpTo));
    }
  };

  // API Actions
  const handleReject = async () => {
    if(!window.confirm('Bạn có chắc chắn muốn XÓA / TỪ CHỐI bài hát này?')) return;
    try {
      setLoading(true);
      await api.put(`/admin/moderation/${data._id}/reject`);
      onSuccess(); onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi từ chối bài hát');
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if(!window.confirm('Đánh dấu là An toàn và đưa bài hát này lên LIVE?')) return;
    try {
      setLoading(true);
      await api.put(`/admin/moderation/${data._id}/approve`);
      onSuccess(); onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi duyệt bài hát');
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-[scaleUp_0.2s_ease-out]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[20px]">policy</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191b24] leading-tight">Match Review: {data.id}</h2>
              <p className="text-xs font-semibold text-[#c84000]">AI Confidence Score: {data.aiScore}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={jumpToMatch}
                className="px-4 py-1.5 bg-[#ba1a1a]/10 text-[#ba1a1a] text-xs font-bold rounded-full hover:bg-[#ba1a1a]/20 transition-colors flex items-center gap-1.5 border border-[#ba1a1a]/20"
             >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                Jump to Flagged Segment
             </button>
            <button onClick={onClose} className="p-1.5 text-[#737687] hover:bg-[#ecedfa] hover:text-[#191b24] rounded-md transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-[400px]">
          {/* TRÁI: BÀI HÁT USER UPLOAD */}
          <div className="flex-1 p-6 lg:border-r border-[#e1e1ee] bg-[#faf8ff]">
            <div className="inline-block px-2 py-1 bg-white border border-[#c3c6d8] rounded text-[10px] font-bold uppercase tracking-widest text-[#737687] mb-4">
              Uploaded Submission
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-md border border-[#e1e1ee] flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden">
                <img src={data.imageUrl !== 'blocked_by_ai' ? data.imageUrl : '[https://via.placeholder.com/150/e1e1ee/737687?text=Blocked](https://via.placeholder.com/150/e1e1ee/737687?text=Blocked)'} alt="cover" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#191b24] mb-1 truncate max-w-[250px]">{data.title}</h3>
                <p className="text-sm font-semibold text-[#0f62fe] mb-1">{data.artist}</p>
                <p className="text-xs text-[#737687]">{data.timeFlagged}</p>
              </div>
            </div>

            {/* User Waveform Player - Có xử lý trường hợp bị Block */}
            <div className="bg-white p-4 rounded-lg border border-[#e1e1ee] shadow-sm">
              {data.audioUrl === 'blocked_by_ai' ? (
                <div className="flex flex-col items-center justify-center py-4 opacity-80 text-center">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-3xl mb-2">block</span>
                  <p className="text-sm font-bold text-[#ba1a1a]">Bản ghi âm đã bị AI xóa vĩnh viễn</p>
                  <p className="text-[10px] text-[#737687] mt-1 px-4">Hệ thống không lưu trữ file vi phạm bản quyền nặng lên Cloudinary để tiết kiệm dung lượng đĩa.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-2">
                    <button
                      onClick={handlePlayUser}
                      className="w-10 h-10 shrink-0 rounded-full bg-[#0f62fe] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm mt-1"
                    >
                      <span className="material-symbols-outlined">{isPlayingUser ? 'pause' : 'play_arrow'}</span>
                    </button>
                    <div className="flex-1 overflow-hidden relative flex flex-col gap-1">
                      <div ref={userWaveRef} className="w-full"></div>
                      <div ref={userSpecRef} className="w-full mt-1 border border-[#e1e1ee] rounded-sm overflow-hidden"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#737687]">
                    <span>{userTime}</span>
                    <span className="text-[#0f62fe] font-bold">Cloudinary Source</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PHẢI: BÀI HÁT GỐC TỪ CLOUDFLARE R2 */}
          <div className="flex-1 p-6 bg-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ba1a1a]"></div>

            <div className="inline-block px-2 py-1 bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 rounded text-[10px] font-bold uppercase tracking-widest text-[#ba1a1a] mb-4">
              Copyrighted Match (FMA DB)
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-[#191b24] rounded-md border border-[#e1e1ee] flex-shrink-0 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-3xl">album</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#191b24] mb-1">{data.originalTrack}</h3>
                <p className="text-sm font-semibold text-[#ba1a1a] mb-1">Official Database Record</p>
                <p className="text-xs text-[#006e2d] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cloud_done</span> R2 Storage Connected
                </p>
              </div>
            </div>

            {/* Original Track Waveform Player */}
            <div className="bg-[#faf8ff] p-4 rounded-lg border border-[#e1e1ee] shadow-sm mb-6">
              <div className="flex items-start gap-3 mb-2">
                <button
                  onClick={handlePlayOrig}
                  className="w-10 h-10 shrink-0 rounded-full bg-white border border-[#ba1a1a] text-[#ba1a1a] flex items-center justify-center hover:bg-[#ffdad6] transition-colors shadow-sm mt-1"
                >
                  <span className="material-symbols-outlined">{isPlayingOrig ? 'pause' : 'play_arrow'}</span>
                </button>
                <div className="flex-1 overflow-hidden relative flex flex-col gap-1">
                  <div ref={origWaveRef} className="w-full"></div>
                  <div ref={origSpecRef} className="w-full mt-1 border border-[#e1e1ee] rounded-sm overflow-hidden"></div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#737687]">
                <span>{origTime}</span>
              </div>
            </div>

            <div className="p-4 border border-[#ba1a1a]/20 bg-[#ba1a1a]/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">report</span>
                <span className="text-sm font-bold text-[#ba1a1a]">Detection Summary</span>
              </div>
              <p className="text-xs text-[#424656] leading-relaxed">
                Hệ thống FAISS phát hiện <strong>{aiMatches.length} đoạn</strong> vi phạm với tổng thời lượng <strong>{aiMatches.length * 5} giây</strong>.
                Đoạn âm thanh bôi màu <strong className="text-[#ba1a1a]">đỏ</strong> là vùng bị hệ thống AI nghi ngờ sao chép. Hãy xem thêm biểu đồ Spectrogram để xác nhận.
              </p>
            </div>
          </div>
        </div>

        {/* NÚT ACTION */}
        <div className="px-6 py-4 border-t border-[#e1e1ee] flex justify-end items-center gap-3 bg-[#f2f3ff]/50">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-[#737687] hover:text-[#191b24] transition-colors">
            Skip for Now
          </button>
          <div className="h-6 w-px bg-[#c3c6d8] mx-1"></div>

          <button onClick={handleReject} disabled={loading} className="px-6 py-2.5 bg-[#ba1a1a] text-white text-sm font-bold rounded-md hover:bg-[#a41717] transition-all shadow-sm flex items-center gap-2">
            {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">block</span>}
            Reject (Delete)
          </button>

          <button onClick={handleApprove} disabled={loading} className="px-6 py-2.5 bg-[#006e2d] text-white text-sm font-bold rounded-md hover:bg-[#005c25] transition-all shadow-sm flex items-center gap-2">
            {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">check_circle</span>}
            Approve (False Alarm)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationReviewModal;
