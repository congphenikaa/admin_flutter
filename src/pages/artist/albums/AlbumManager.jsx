import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

// ==========================================
// SHARED: TrackColumn sub-component
// ==========================================
const TrackColumn = ({ title, titleColor = 'text-[#a1a1aa]', borderColor = 'border-white/5', tracks, loading, emptyMsg, emptyIcon, emptyDesc, numbered, onAction, actionIcon, actionStyle, disabled, formatTime }) => (
  <div className="flex flex-col h-full">
    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${titleColor}`}>{title}</h3>
    <div className={`flex-1 bg-[#131313] border ${borderColor} rounded-xl p-2 overflow-y-auto max-h-[400px]`}>
      {loading ? (
        <p className="text-xs text-[#737373] p-4 text-center">Đang lấy danh sách nhạc...</p>
      ) : tracks.length === 0 ? (
        emptyIcon ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
            <span className="material-symbols-outlined text-4xl text-[#a1a1aa] mb-2">{emptyIcon}</span>
            <p className="text-sm text-[#a1a1aa]">{emptyDesc}</p>
          </div>
        ) : (
          <p className="text-xs text-[#737373] p-4 text-center">{emptyMsg}</p>
        )
      ) : (
        tracks.map((track, index) => (
          <div key={track._id} className={`flex items-center justify-between p-3 ${numbered ? 'bg-[#201f1f] rounded-lg mb-2 border border-white/5' : 'hover:bg-[#201f1f] rounded-lg border-b border-white/5 last:border-0'} transition-colors group`}>
            <div className="flex items-center gap-3">
              {numbered ? (
                <span className="text-xs font-bold text-[#53e076] w-4">{index + 1}.</span>
              ) : (
                <div className="w-8 h-8 bg-[#2a2a2a] rounded flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#a1a1aa] text-[18px]">music_note</span>
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white truncate max-w-[130px]">{track.title}</p>
                {!numbered && <p className="text-xs text-[#a1a1aa]">{formatTime(track.duration)}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {numbered && <span className="text-[#a1a1aa] text-sm">{formatTime(track.duration)}</span>}
              <button onClick={() => onAction(track)} disabled={disabled} className={`${numbered ? 'p-1.5 rounded-md' : 'w-8 h-8 rounded-full bg-[#2a2a2a] text-white'} flex items-center justify-center transition-colors ${actionStyle}`}>
                <span className="material-symbols-outlined text-[18px]">{actionIcon}</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const AlbumManager = () => {
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, album: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  // ==========================================
  // COMPONENT: AlbumBuilder (thêm mới)
  // ==========================================
  const AlbumBuilder = ({ setView }) => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [availableTracks, setAvailableTracks] = useState([]);
    const [albumTracks, setAlbumTracks] = useState([]);
    const [loadingPublish, setLoadingPublish] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
      const fetchLiveSongs = async () => {
        try {
          const response = await api.get('/artist/my-songs');
          if (response.data.success) {
            const liveSongs = response.data.songs.filter(s => s.status === 'live');
            setAvailableTracks(liveSongs);
          }
        } catch (err) {
          setMessage({ type: 'error', text: 'Lỗi khi tải danh sách bài hát.' });
        } finally {
          setFetching(false);
        }
      };
      fetchLiveSongs();
    }, []);

    const formatTime = (seconds) =>
      `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    const handlePublish = async () => {
      if (!title || !image) {
        setMessage({ type: 'error', text: 'Vui lòng nhập Tên Album và tải Ảnh bìa!' });
        return;
      }
      if (albumTracks.length === 0) {
        setMessage({ type: 'error', text: 'Album phải có ít nhất 1 bài hát!' });
        return;
      }
      try {
        setLoadingPublish(true);
        setMessage({ type: 'warning', text: 'Đang tạo Album và upload ảnh bìa... (1/2)' });
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('image', image);
        const albumRes = await api.post('/artist/albums/create', formData);
        if (albumRes.data.success) {
          const newAlbumId = albumRes.data.album._id;
          setMessage({ type: 'warning', text: 'Đang sắp xếp các bài hát vào Album... (2/2)' });
          const promises = albumTracks.map(track =>
            api.put('/artist/albums/add-song', { albumId: newAlbumId, songId: track._id })
          );
          await Promise.all(promises);
          setMessage({ type: 'success', text: '🎉 Chúc mừng! Album của bạn đã được xuất bản!' });
          setTimeout(() => setView('list'), 2500);
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi tạo Album.' });
      } finally {
        setLoadingPublish(false);
      }
    };

    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-8">
          <button onClick={() => setView('list')} className="flex items-center text-[#a1a1aa] hover:text-white transition-colors mb-4 text-sm font-semibold">
            <span className="material-symbols-outlined mr-1 text-[18px]">arrow_back</span>
            Back to Albums
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Album Builder</h1>
          <p className="text-[#a1a1aa] text-lg">Package your published tracks into Albums or EPs.</p>
        </div>
        {message.text && (
          <div className={`p-4 rounded-lg mb-8 font-bold ${
            message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/50' :
            message.type === 'success' ? 'bg-[#53e076]/10 text-[#53e076] border border-[#53e076]/50' :
            'bg-orange-500/10 text-orange-400 border border-orange-500/50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">
                {message.type === 'error' ? 'error' : message.type === 'success' ? 'check_circle' : 'hourglass_empty'}
              </span>
              {message.text}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#53e076]">info</span>
                Album Details
              </h2>
              <div className="mb-6">
                <div className="relative group w-full aspect-square border-2 border-dashed border-white/10 rounded-xl bg-[#131313] hover:bg-[#201f1f] hover:border-[#53e076]/50 transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner">
                  <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} disabled={loadingPublish} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {image ? (
                    <img src={URL.createObjectURL(image)} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#a1a1aa] text-4xl mb-3 group-hover:text-[#53e076] transition-colors">add_photo_alternate</span>
                      <span className="text-sm font-bold text-[#a1a1aa] group-hover:text-white transition-colors">Upload Cover Art</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#ba1a1a] mt-2">Bắt buộc</span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Album Title <span className="text-[#ba1a1a]">*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loadingPublish} className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#53e076] transition-all" placeholder="Enter album name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={loadingPublish} className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#53e076] transition-all resize-none" placeholder="Album story or credits..." rows={4} />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 shadow-lg flex flex-col h-full min-h-[600px]">
              <div className="p-6 border-b border-white/5 bg-[#201f1f] rounded-t-2xl flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#53e076]">queue_music</span>
                  Tracklist Management
                </h2>
                <span className="px-3 py-1 bg-[#53e076]/10 border border-[#53e076]/20 text-[#53e076] text-xs font-bold rounded-full">AI Checked Tracks Only</span>
              </div>
              <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <TrackColumn title="Available LIVE Tracks" tracks={availableTracks} loading={fetching} emptyMsg="Không có bài hát nào (Hoặc bài hát đang chờ AI duyệt)." onAction={(t) => { setAvailableTracks(prev => prev.filter(x => x._id !== t._id)); setAlbumTracks(prev => [...prev, t]); }} actionIcon="add" actionStyle="hover:bg-[#53e076] hover:text-[#003914]" disabled={loadingPublish} formatTime={formatTime} />
                <TrackColumn title={`Album Tracks (${albumTracks.length})`} titleColor="text-[#53e076]" borderColor="border-[#53e076]/20" tracks={albumTracks} numbered emptyIcon="move_item" emptyDesc="Bấm nút '+' để đẩy nhạc vào Album" onAction={(t) => { setAlbumTracks(prev => prev.filter(x => x._id !== t._id)); setAvailableTracks(prev => [...prev, t]); }} actionIcon="delete" actionStyle="text-[#ba1a1a] hover:bg-[#ba1a1a]/10" disabled={loadingPublish} formatTime={formatTime} />
              </div>
              <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#201f1f] rounded-b-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Total Tracks Selected</span>
                  <span className="text-xl font-black text-[#53e076]">{albumTracks.length}</span>
                </div>
                <button onClick={handlePublish} disabled={loadingPublish} className={`px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 text-sm uppercase tracking-wider ${loadingPublish ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' : 'bg-[#53e076] text-[#003914] hover:bg-[#1db954] shadow-[0_0_15px_rgba(83,224,118,0.3)] active:scale-95'}`}>
                  {loadingPublish && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                  {loadingPublish ? 'Publishing...' : 'Publish Album'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // COMPONENT: AlbumEditor (chỉnh sửa album)
  // ==========================================
  const AlbumEditor = ({ album, setView }) => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState(album.title || '');
    const [description, setDescription] = useState(album.description || '');
    const [availableTracks, setAvailableTracks] = useState([]);
    const [albumTracks, setAlbumTracks] = useState(album.songs || []);
    const [loadingSave, setLoadingSave] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
      const fetchLiveSongs = async () => {
        try {
          const response = await api.get('/artist/my-songs');
          if (response.data.success) {
            const liveSongs = response.data.songs.filter(s => s.status === 'live');
            const currentIds = new Set((album.songs || []).map(s => s._id));
            setAvailableTracks(liveSongs.filter(s => !currentIds.has(s._id)));
          }
        } catch (err) {
          setMessage({ type: 'error', text: 'Lỗi khi tải danh sách bài hát.' });
        } finally {
          setFetching(false);
        }
      };
      fetchLiveSongs();
    }, []);

    const formatTime = (seconds) =>
      typeof seconds === 'number'
        ? `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
        : seconds || '';

    const handleSave = async () => {
      if (!title.trim()) {
        setMessage({ type: 'error', text: 'Tên Album không được để trống!' });
        return;
      }
      if (albumTracks.length === 0) {
        setMessage({ type: 'error', text: 'Album phải có ít nhất 1 bài hát!' });
        return;
      }
      try {
        setLoadingSave(true);
        setMessage({ type: 'warning', text: 'Đang lưu thay đổi...' });
        const formData = new FormData();
        formData.append('albumId', album._id);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('songIds', JSON.stringify(albumTracks.map(t => t._id)));
        if (image) formData.append('image', image);
        const res = await api.put('/artist/albums/update', formData);
        if (res.data.success) {
          setMessage({ type: 'success', text: '✅ Album đã được cập nhật thành công!' });
          setTimeout(() => setView('list'), 2000);
        } else {
          setMessage({ type: 'error', text: res.data.message || 'Lỗi khi cập nhật Album.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra.' });
      } finally {
        setLoadingSave(false);
      }
    };

    const coverPreview = image ? URL.createObjectURL(image) : album.image;

    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-8">
          <button onClick={() => setView('list')} className="flex items-center text-[#a1a1aa] hover:text-white transition-colors mb-4 text-sm font-semibold">
            <span className="material-symbols-outlined mr-1 text-[18px]">arrow_back</span>
            Back to Albums
          </button>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-400">edit</span>
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">Edit Album</h1>
              <p className="text-[#a1a1aa] text-sm">Chỉnh sửa thông tin và danh sách bài hát của album.</p>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-8 font-bold ${
            message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/50' :
            message.type === 'success' ? 'bg-[#53e076]/10 text-[#53e076] border border-[#53e076]/50' :
            'bg-amber-500/10 text-amber-400 border border-amber-500/50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">
                {message.type === 'error' ? 'error' : message.type === 'success' ? 'check_circle' : 'hourglass_empty'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1c1b1b] rounded-2xl border border-amber-500/10 p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">info</span>
                Album Details
              </h2>
              <div className="mb-6">
                <div className="relative group w-full aspect-square border-2 border-dashed border-white/10 rounded-xl bg-[#131313] hover:bg-[#201f1f] hover:border-amber-500/50 transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner">
                  <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} disabled={loadingSave} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white text-3xl mb-1">edit</span>
                        <span className="text-white text-xs font-bold">Đổi ảnh bìa</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#a1a1aa] text-4xl mb-3 group-hover:text-amber-400 transition-colors">add_photo_alternate</span>
                      <span className="text-sm font-bold text-[#a1a1aa] group-hover:text-white transition-colors">Upload Cover Art</span>
                    </>
                  )}
                </div>
                {image && <p className="text-xs text-amber-400 mt-2 text-center font-bold">✓ Ảnh mới sẽ thay thế ảnh cũ</p>}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Album Title <span className="text-[#ba1a1a]">*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loadingSave} className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-amber-500 transition-all" placeholder="Enter album name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={loadingSave} className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-amber-500 transition-all resize-none" placeholder="Album story or credits..." rows={4} />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 shadow-lg flex flex-col h-full min-h-[600px]">
              <div className="p-6 border-b border-white/5 bg-[#201f1f] rounded-t-2xl flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">queue_music</span>
                  Tracklist Management
                </h2>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full">Chỉnh sửa danh sách</span>
              </div>
              <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <TrackColumn title="Available LIVE Tracks" tracks={availableTracks} loading={fetching} emptyMsg="Không có bài hát nào khả dụng." onAction={(t) => { setAvailableTracks(prev => prev.filter(x => x._id !== t._id)); setAlbumTracks(prev => [...prev, t]); }} actionIcon="add" actionStyle="hover:bg-amber-500 hover:text-[#3a1d00]" disabled={loadingSave} formatTime={formatTime} />
                <TrackColumn title={`Album Tracks (${albumTracks.length})`} titleColor="text-amber-400" borderColor="border-amber-500/20" tracks={albumTracks} numbered emptyIcon="move_item" emptyDesc="Bấm nút '+' để thêm bài hát" onAction={(t) => { setAlbumTracks(prev => prev.filter(x => x._id !== t._id)); setAvailableTracks(prev => [...prev, t]); }} actionIcon="delete" actionStyle="text-[#ba1a1a] hover:bg-[#ba1a1a]/10" disabled={loadingSave} formatTime={formatTime} />
              </div>
              <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#201f1f] rounded-b-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Total Tracks</span>
                  <span className="text-xl font-black text-amber-400">{albumTracks.length}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setView('list')} disabled={loadingSave} className="px-6 py-3 rounded-xl font-bold border border-white/10 text-[#a1a1aa] hover:text-white hover:border-white/30 transition-all text-sm">Hủy</button>
                  <button onClick={handleSave} disabled={loadingSave} className={`px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 text-sm uppercase tracking-wider ${loadingSave ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' : 'bg-amber-500 text-[#3a1d00] hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95'}`}>
                    {loadingSave && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                    {loadingSave ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // MAIN AlbumManager (list + fetch)
  // ==========================================
  useEffect(() => {
    fetchAlbums();
  }, [view]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await api.get('/artist/albums');
      if (response.data.success) {
        setAlbums(response.data.albums);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách Album');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.album) return;
    try {
      setDeleteLoading(true);
      setDeleteMessage('');
      const res = await api.delete('/artist/albums/delete', { data: { albumId: deleteModal.album._id } });
      if (res.data.success) {
        setAlbums(prev => prev.filter(a => a._id !== deleteModal.album._id));
        setDeleteModal({ open: false, album: null });
      } else {
        setDeleteMessage(res.data.message || 'Lỗi khi xóa Album.');
      }
    } catch (err) {
      setDeleteMessage(err.response?.data?.message || 'Có lỗi xảy ra khi xóa Album.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (view === 'add') return <AlbumBuilder setView={setView} />;
  if (view === 'edit' && editingAlbum) return <AlbumEditor album={editingAlbum} setView={setView} />;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Albums &amp; EPs</h1>
          <p className="text-[#a1a1aa] text-lg">Manage your released collections and upcoming projects.</p>
        </div>
        <button onClick={() => setView('add')} className="bg-[#53e076] text-[#003914] px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(83,224,118,0.2)] flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>library_add</span>
          Create New Album
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <p className="text-center text-[#a1a1aa] py-10 font-bold animate-pulse">Đang tải dữ liệu Album...</p>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-2xl bg-[#1c1b1b]">
          <span className="material-symbols-outlined text-6xl text-[#a1a1aa] mb-4">album</span>
          <p className="text-[#a1a1aa] font-bold text-lg mb-4">Bạn chưa có Album nào</p>
          <button onClick={() => setView('add')} className="text-[#53e076] hover:underline font-bold">Hãy tạo Album đầu tiên của bạn</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div key={album._id} className="bg-[#1c1b1b] border border-white/5 rounded-2xl p-4 hover:bg-[#201f1f] transition-all group shadow-lg hover:shadow-xl hover:border-white/10">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-[#2a2a2a] shadow-inner">
                <img src={album.image} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button onClick={() => { setEditingAlbum(album); setView('edit'); }} className="w-11 h-11 bg-amber-500 text-[#3a1d00] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg" title="Sửa album">
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>
                  </button>
                  <button onClick={() => { setDeleteModal({ open: true, album }); setDeleteMessage(''); }} className="w-11 h-11 bg-[#ba1a1a] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg" title="Xóa album">
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                  </button>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-[#53e076]/90 backdrop-blur-md text-[#003914] text-[10px] font-black uppercase tracking-wider rounded border border-[#53e076] shadow-lg">LIVE</span>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1 truncate group-hover:text-[#53e076] transition-colors">{album.title}</h3>
                <div className="flex items-center justify-between text-[#a1a1aa] text-sm mb-3">
                  <span className="bg-white/5 px-2 py-0.5 rounded text-xs font-bold">{new Date(album.releaseDate).getFullYear()}</span>
                  <span className="flex items-center gap-1 font-bold text-[#53e076]">
                    <span className="material-symbols-outlined text-[16px]">queue_music</span>
                    {album.songs?.length || 0} tracks
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button onClick={() => { setEditingAlbum(album); setView('edit'); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  Sửa
                </button>
                <button onClick={() => { setDeleteModal({ open: true, album }); setDeleteMessage(''); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== DELETE CONFIRM MODAL ==================== */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1c1b1b] border border-red-500/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-red-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Xác nhận xóa Album</h3>
                <p className="text-[#a1a1aa] text-sm mt-0.5">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <div className="bg-[#131313] rounded-xl p-4 mb-6 flex items-center gap-3">
              <img src={deleteModal.album?.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div>
                <p className="text-white font-bold">{deleteModal.album?.title}</p>
                <p className="text-[#a1a1aa] text-xs">{deleteModal.album?.songs?.length || 0} tracks</p>
              </div>
            </div>
            <p className="text-[#a1a1aa] text-sm mb-6">
              Bạn có chắc chắn muốn xóa album <span className="font-bold text-white">"{deleteModal.album?.title}"</span>? Các bài hát trong album sẽ không bị xóa, chỉ album bị xóa.
            </p>
            {deleteMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold mb-4">{deleteMessage}</div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal({ open: false, album: null }); setDeleteMessage(''); }} disabled={deleteLoading} className="flex-1 py-3 rounded-xl border border-white/10 text-[#a1a1aa] hover:text-white hover:border-white/30 font-bold transition-all">Hủy bỏ</button>
              <button onClick={handleDeleteConfirm} disabled={deleteLoading} className={`flex-1 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${deleteLoading ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95'}`}>
                {deleteLoading && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                {deleteLoading ? 'Đang xóa...' : 'Xóa Album'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumManager;