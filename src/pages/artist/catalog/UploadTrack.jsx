import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import api from '../../../utils/api';

const UploadTrack = ({ setView }) => {
  // Trạng thái Form
  const [audio, setAudio] = useState(null);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [album, setAlbum] = useState('none');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(0);
  
  // Trạng thái Loading và Thông báo
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error' | 'warning'
  const [albumData, setAlbumData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [resAlbum, resArtist, resCategory] = await Promise.all([
          api.get('/album/list'),
          api.get('/artist/list'),
          api.get('/category/list')
        ]);

        if (resAlbum.data.success) setAlbumData(resAlbum.data.albums);
        if (resArtist.data.success) setArtistData(resArtist.data.artists);
        if (resCategory.data.success) setCategoryData(resCategory.data.categories);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Không tải được danh sách album/nghệ sĩ/thể loại.' });
      }
    };

    loadOptions();
  }, []);

  const artistOptions = artistData.map((item) => ({ value: item._id, label: item.name }));
  const albumOptions = albumData.map((item) => ({ value: item._id, label: item.title }));
  const categoryOptions = categoryData.map((item) => ({ value: item._id, label: item.name }));

  // Custom styles for react-select to match Sonic Dark theme
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#131313',
      borderColor: state.isFocused ? '#53e076' : '#353534',
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(83, 224, 118, 0.1)' : 'none',
      color: '#e5e2e1',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: '#53e076',
      },
    }),
    input: (base) => ({
      ...base,
      color: '#e5e2e1',
      fontWeight: '500',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#bccbb9',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#e5e2e1',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1c1b1b',
      border: '1px solid #353534',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: '#1c1b1b',
      paddingTop: '4px',
      paddingBottom: '4px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#53e076'
        : state.isFocused
        ? '#201f1f'
        : 'transparent',
      color: state.isSelected ? '#003914' : '#e5e2e1',
      cursor: 'pointer',
      fontWeight: state.isSelected ? '600' : '400',
      transition: 'all 0.15s ease',
      padding: '8px 12px',
      '&:hover': {
        backgroundColor: state.isSelected ? '#53e076' : '#201f1f',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#bccbb9',
      cursor: 'pointer',
      '&:hover': {
        color: '#53e076',
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#bccbb9',
      cursor: 'pointer',
      '&:hover': {
        color: '#53e076',
      },
    }),
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    setAudio(file);
    if (file) {
      const audioObj = new Audio(URL.createObjectURL(file));
      audioObj.onloadedmetadata = () => setDuration(Math.floor(audioObj.duration));
    }
  };

  // Xử lý Gửi Form
  const handleSubmit = async () => {
    // 1. Validate
    if (!audio || !image || !title || !artist || !category) {
        setMessage({ type: 'error', text: 'Vui lòng điền đủ Tên bài hát, File Audio, Ảnh bìa, Nghệ sĩ và Thể loại!' });
        return;
    }

    // 2. Đóng gói dữ liệu bằng FormData (vì có gửi file)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('album', album);
    formData.append('artist', artist);
    formData.append('category', category);
    formData.append('duration', duration);
    formData.append('audio', audio);
    formData.append('image', image);

    try {
        setLoading(true);
        setMessage({ type: 'warning', text: 'Đang tải lên và chờ AI phân tích bản quyền... (Có thể mất vài phút)' });
        
        // 3. Gọi API
        const response = await api.post('/artist/songs/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
            // Trường hợp An toàn hoặc Bị Flag
            setMessage({ 
                type: response.data.song.status === 'live' ? 'success' : 'warning', 
                text: response.data.message 
            });
            // Tự động quay về list sau 2 giây
            setTimeout(() => setView('list'), 2500);
        }
    } catch (error) {
        // Trường hợp bị AI chặn vì đạo nhạc (Lỗi 403) hoặc lỗi server
        const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi tải bài hát lên.';
        setMessage({ type: 'error', text: errorMsg });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-[fadeIn_0.3s_ease-out]">

      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => setView('list')}
          className="flex items-center text-[#bccbb9] hover:text-[#e5e2e1] transition-colors mb-4 text-sm font-semibold"
        >
          <span className="material-symbols-outlined mr-1 text-[18px]">arrow_back</span>
          Back to My Tracks
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-[#e5e2e1] mb-2">Upload New Track</h1>
        <p className="text-[#bccbb9] text-lg">Submit your latest creation for AI moderation and distribution.</p>
      </div>

      {/* Hiển thị Thông báo (Alert) */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Area: Upload & Metadata */}
        <div className="lg:col-span-2 space-y-8">

          {/* Audio Upload Zone */}
          <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#201f1f]">
              <h2 className="text-lg font-bold text-[#e5e2e1] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#53e076]">audio_file</span>
                Source Audio
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#53e076] bg-[#53e076]/10 px-2 py-1 rounded border border-[#53e076]/20">Required</span>
            </div>
            <div className="p-8 relative group">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center bg-[#131313] transition-all text-center relative overflow-hidden ${!loading && 'group-hover:bg-[#201f1f] group-hover:border-[#53e076]/50'}`}>
                {audio ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#53e076] shadow-[0_0_30px_rgba(83,224,118,0.4)] flex items-center justify-center mb-4 text-[#003914] scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <p className="text-xl font-bold text-[#e5e2e1] mb-1">{audio.name}</p>
                    <p className="text-[#53e076] text-sm font-semibold mb-3">Ready for processing</p>
                    {duration > 0 && (
                      <p className="inline-flex items-center px-3 py-1 rounded-full bg-[#53e076]/10 text-xs font-semibold text-[#53e076] border border-[#53e076]/20">
                        <span className="material-symbols-outlined text-[14px] mr-1">timer</span>
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#53e076]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 rounded-full bg-[#2a2a2a] shadow-lg flex items-center justify-center mb-4 text-[#bccbb9] group-hover:text-[#53e076] group-hover:scale-110 transition-all border border-white/5">
                      <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    </div>
                    <p className="text-xl font-bold text-[#e5e2e1] mb-2">Drag and drop audio file</p>
                    <p className="text-[#bccbb9] text-sm mb-4">or click to browse from your computer</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Zone */}
          <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/5 bg-[#201f1f]">
              <h2 className="text-lg font-bold text-[#e5e2e1] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#53e076]">info</span>
                Track Metadata
              </h2>
            </div>
            <div className="p-6 lg:p-8 flex flex-col md:flex-row gap-8">
              {/* Artwork Upload */}
              <div className="w-full md:w-1/3 shrink-0">
                <label className="block text-sm font-bold text-[#e5e2e1] mb-3">Cover Art <span className="text-[#ffb4ab]">*</span></label>
                <div className="relative group w-full aspect-square border-2 border-dashed border-white/10 rounded-xl bg-[#131313] hover:bg-[#201f1f] hover:border-[#53e076]/50 transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {image ? (
                    <>
                      <img src={URL.createObjectURL(image)} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#bccbb9] text-4xl mb-3 group-hover:text-[#53e076] transition-colors">add_photo_alternate</span>
                      <span className="text-sm font-bold text-[#bccbb9] group-hover:text-[#e5e2e1] transition-colors">Upload Image</span>
                    </>
                  )}
                </div>
              </div>

              {/* Text Inputs */}
              <div className="flex-1 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#e5e2e1] mb-2">Track Title <span className="text-[#ffb4ab]">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-[#e5e2e1] focus:outline-none focus:border-[#53e076] transition-all placeholder:text-[#bccbb9]"
                    placeholder="Enter the official track name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#e5e2e1] mb-2">Artist <span className="text-[#ffb4ab]">*</span></label>
                    <Select
                      options={artistOptions}
                      onChange={(opt) => setArtist(opt ? opt.value : '')}
                      placeholder="Select artist..."
                      isClearable
                      isLoading={artistData.length === 0}
                      styles={selectStyles}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#e5e2e1] mb-2">Album</label>
                    <Select
                      options={albumOptions}
                      onChange={(opt) => setAlbum(opt ? opt.value : 'none')}
                      placeholder="Select album..."
                      isClearable
                      styles={selectStyles}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#e5e2e1] mb-2">Category <span className="text-[#ffb4ab]">*</span></label>
                  <Select
                    options={categoryOptions}
                    onChange={(opt) => setCategory(opt ? opt.value : '')}
                    placeholder="Select category..."
                    isClearable
                    styles={selectStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#e5e2e1] mb-2">Track Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#131313] border border-white/10 rounded-lg py-3 px-4 text-[#e5e2e1] focus:outline-none focus:border-[#53e076] transition-all resize-none placeholder:text-[#bccbb9]"
                    placeholder="Add credits, lyrics, or a short story about the track..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Actions */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          {/* Action Panel */}
          <div className="bg-[#1c1b1b] rounded-2xl border border-white/5 overflow-hidden shadow-lg p-6 space-y-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3.5 font-black text-sm rounded-xl transition-all flex justify-center items-center gap-2
                ${loading ? 'bg-[#2a2a2a] text-[#bccbb9] cursor-not-allowed' : 'bg-[#53e076] text-[#003914] shadow-[0_0_20px_rgba(83,224,118,0.2)] hover:bg-[#1db954] active:scale-[0.98]'}`}
            >
              {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Processing AI...
                  </>
              ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>publish</span>
                    Submit for AI Review
                  </>
              )}
            </button>
          </div>

          {/* AI Notice Panel */}
          <div className="p-5 rounded-xl bg-[#520072]/20 border border-[#b600f8]/30 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <span className="material-symbols-outlined text-7xl text-[#ebb2ff]">smart_toy</span>
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="material-symbols-outlined text-[#ebb2ff] text-[20px]">info</span>
              <span className="text-sm font-black text-[#ebb2ff] uppercase tracking-wider">AI Moderation</span>
            </div>
            <p className="text-xs text-[#on-secondary-container] leading-relaxed relative z-10 font-medium"
              style={{ color: '#fff6fc' }}>
              Upon submission, your track will be analyzed by our AI to ensure copyright compliance and audio quality standards. This process usually takes under 1-2 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTrack;