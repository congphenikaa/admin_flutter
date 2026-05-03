import React from 'react';

const ModerationReviewModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-[scaleUp_0.2s_ease-out]">
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
          <button onClick={onClose} className="p-1.5 text-[#737687] hover:bg-[#ecedfa] hover:text-[#191b24] rounded-md transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-[400px]">
          <div className="flex-1 p-6 lg:border-r border-[#e1e1ee] bg-[#faf8ff]">
            <div className="inline-block px-2 py-1 bg-white border border-[#c3c6d8] rounded text-[10px] font-bold uppercase tracking-widest text-[#737687] mb-4">
              Uploaded Submission
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-md border border-[#e1e1ee] flex-shrink-0 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-gray-400 text-3xl">music_note</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#191b24] mb-1">{data.title}</h3>
                <p className="text-sm font-semibold text-[#0f62fe] mb-1">{data.artist}</p>
                <p className="text-xs text-[#737687]">Uploaded: {data.timeFlagged}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#e1e1ee] shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <button className="w-10 h-10 rounded-full bg-[#0f62fe] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <span className="material-symbols-outlined">play_arrow</span>
                </button>
                <div className="flex-1 h-10 flex items-center">
                  <div className="w-full h-8 bg-gray-100 rounded flex items-center justify-between px-1 gap-0.5 opacity-60">
                    {[...Array(40)].map((_, i) => (
                      <div key={i} className="w-1 bg-[#b4c5ff] rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#737687]">
                <span>00:00</span>
                <span>03:42</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 bg-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ba1a1a]"></div>

            <div className="inline-block px-2 py-1 bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 rounded text-[10px] font-bold uppercase tracking-widest text-[#ba1a1a] mb-4">
              Copyrighted Match
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-md border border-[#e1e1ee] flex-shrink-0 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-gray-400 text-3xl">album</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#191b24] mb-1">{data.originalTrack}</h3>
                <p className="text-sm font-semibold text-[#ba1a1a] mb-1">Official Database Record</p>
                <p className="text-xs text-[#737687]">Registered: 2021</p>
              </div>
            </div>

            <div className="bg-[#faf8ff] p-4 rounded-lg border border-[#e1e1ee] shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <button className="w-10 h-10 rounded-full bg-white border border-[#c3c6d8] text-[#191b24] flex items-center justify-center hover:bg-[#f2f3ff] transition-colors shadow-sm">
                  <span className="material-symbols-outlined">play_arrow</span>
                </button>
                <div className="flex-1 h-10 flex items-center">
                  <div className="w-full h-8 bg-gray-200 rounded flex items-center justify-between px-1 gap-0.5 opacity-60">
                    {[...Array(40)].map((_, i) => (
                      <div key={i} className="w-1 bg-gray-400 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#737687]">
                <span>00:00</span>
                <span>04:15</span>
              </div>
            </div>

            <div className="mt-6 p-4 border border-[#ba1a1a]/20 bg-[#ba1a1a]/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">report</span>
                <span className="text-sm font-bold text-[#ba1a1a]">Detection Summary</span>
              </div>
              <p className="text-xs text-[#424656] leading-relaxed">
                Significant melodic and harmonic overlap detected. The uploaded submission appears to be an unlicensed copy or remix of the copyrighted work.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e1e1ee] flex justify-end items-center gap-3 bg-[#f2f3ff]/50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-[#737687] hover:text-[#191b24] transition-colors">
            Skip for Now
          </button>
          <div className="h-6 w-px bg-[#c3c6d8] mx-1"></div>
          <button className="px-6 py-2.5 bg-[#ba1a1a] text-white text-sm font-bold rounded-md hover:bg-[#a41717] transition-all shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">block</span>
            Reject
          </button>
          <button className="px-6 py-2.5 bg-[#006e2d] text-white text-sm font-bold rounded-md hover:bg-[#005c25] transition-all shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Approve (False Alarm)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationReviewModal;