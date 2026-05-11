import React, { useState } from 'react';

const AlbumBuilder = ({ setView }) => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');

  // Mock interactive data for tracks
  const [availableTracks, setAvailableTracks] = useState([
    { id: 1, title: 'Starlight Echoes', duration: '03:45' },
    { id: 2, title: 'Midnight Drive', duration: '04:12' },
    { id: 3, title: 'Neon Horizon', duration: '02:58' }
  ]);

  const [albumTracks, setAlbumTracks] = useState([]);

  // Simple mock logic to move tracks between lists
  const addTrackToAlbum = (track) => {
    setAvailableTracks(availableTracks.filter((t) => t.id !== track.id));
    setAlbumTracks([...albumTracks, track]);
  };

  const removeTrackFromAlbum = (track) => {
    setAlbumTracks(albumTracks.filter((t) => t.id !== track.id));
    setAvailableTracks([...availableTracks, track]);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => setView('list')} className="flex items-center text-[#a1a1aa] hover:text-white transition-colors mb-4 text-sm font-semibold">
          <span className="material-symbols-outlined mr-1 text-[18px]">arrow_back</span>
          Back to Albums
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Album Builder</h1>
        <p className="text-[#a1a1aa] text-lg">Package your published tracks into Albums or EPs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Album Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#53e076]">info</span>
              Album Details
            </h2>

            {/* Cover Upload */}
            <div className="mb-6">
              <div className="relative group w-full aspect-square border-2 border-dashed border-white/10 rounded-xl bg-[#131313] hover:bg-[#201f1f] hover:border-[#53e076]/50 transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {image ? (
                  <>
                    <img src={URL.createObjectURL(image)} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <span className="material-symbols-outlined text-white text-3xl mb-2">edit</span>
                      <span className="text-white text-sm font-bold">Change Cover</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[#a1a1aa] text-4xl mb-3 group-hover:text-[#53e076] transition-colors">add_photo_alternate</span>
                    <span className="text-sm font-bold text-[#a1a1aa] group-hover:text-white transition-colors">Upload Cover Art</span>
                    <span className="text-[10px] text-[#737373] mt-1 text-center px-4">Min 3000x3000px<br />1:1 Ratio</span>
                  </>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Album Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#53e076] transition-all"
                  placeholder="Enter album name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Release Date</label>
                <input
                  type="date"
                  className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-[#a1a1aa] focus:outline-none focus:border-[#53e076] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#53e076] transition-all resize-none"
                  placeholder="Album story or credits..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tracklist Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 shadow-lg flex flex-col h-full min-h-[600px]">
            <div className="p-6 border-b border-white/5 bg-[#201f1f] rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#53e076]">queue_music</span>
                Tracklist Management
              </h2>
            </div>

            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Available Tracks */}
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-[#a1a1aa] uppercase tracking-wider mb-4">Available Published Tracks</h3>
                <div className="flex-1 bg-[#131313] border border-white/5 rounded-xl p-2 overflow-y-auto max-h-[400px]">
                  {availableTracks.length === 0 && <p className="text-xs text-[#737373] p-4 text-center">No available tracks.</p>}
                  {availableTracks.map((track) => (
                    <div key={track.id} className="flex items-center justify-between p-3 hover:bg-[#201f1f] rounded-lg transition-colors group border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2a2a2a] rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#a1a1aa] text-[18px]">music_note</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{track.title}</p>
                          <p className="text-xs text-[#a1a1aa]">{track.duration}</p>
                        </div>
                      </div>
                      <button onClick={() => addTrackToAlbum(track)} className="w-8 h-8 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center hover:bg-[#53e076] hover:text-[#003914] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Album Tracks */}
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-[#53e076] uppercase tracking-wider mb-4">Album Tracks ({albumTracks.length})</h3>
                <div className="flex-1 bg-[#131313] border border-[#53e076]/20 rounded-xl p-2 overflow-y-auto max-h-[400px]">
                  {albumTracks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                      <span className="material-symbols-outlined text-4xl text-[#a1a1aa] mb-2">move_item</span>
                      <p className="text-sm text-[#a1a1aa]">Click '+' to add tracks here</p>
                    </div>
                  ) : (
                    albumTracks.map((track, index) => (
                      <div key={track.id} className="flex items-center justify-between p-3 bg-[#201f1f] rounded-lg mb-2 border border-white/5 group">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#737373] cursor-grab hover:text-white">drag_indicator</span>
                          <span className="text-xs font-bold text-[#a1a1aa] w-4">{index + 1}.</span>
                          <p className="text-sm font-bold text-white">{track.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[#a1a1aa] text-sm">{track.duration}</span>
                          <button onClick={() => removeTrackFromAlbum(track)} className="text-[#ba1a1a] p-1.5 hover:bg-[#ba1a1a]/10 rounded-md transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#201f1f] rounded-b-2xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Total Tracks</span>
                <span className="text-lg font-bold text-white">{albumTracks.length}</span>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2.5 rounded-xl font-bold bg-[#2a2a2a] text-white hover:bg-[#353534] transition-all border border-white/5">
                  Save Draft
                </button>
                <button className="px-8 py-2.5 rounded-xl font-bold bg-[#53e076] text-[#003914] hover:bg-[#1db954] shadow-[0_0_15px_rgba(83,224,118,0.2)] transition-all">
                  Publish Album
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AlbumBuilder;