import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select'; 

const EditSong = ({ setView, fetchSongs, editingId, songs }) => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const [loading, setLoading] = useState(false);
    
    // Tìm bài hát cần sửa
    const songData = songs.find(s => s._id === editingId);

    const [name, setName] = useState(songData?.title || "");
    const [desc, setDesc] = useState(songData?.description || "");
    const [duration, setDuration] = useState(songData?.duration || 0);
    
    // State ID
    const [album, setAlbum] = useState(songData?.album?._id || "none");
    const [artist, setArtist] = useState(songData?.artist?._id || "");
    const [category, setCategory] = useState(songData?.category?.[0]?._id || ""); // Lấy phần tử đầu tiên của mảng

    // State File mới (nếu có)
    const [image, setImage] = useState(false);
    const [audio, setAudio] = useState(false);

    // Dữ liệu options
    const [albumData, setAlbumData] = useState([]);
    const [artistData, setArtistData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [resAlbum, resArtist, resCat] = await Promise.all([
                    axios.get(`${url}/api/album/list`),
                    axios.get(`${url}/api/artist/list`),
                    axios.get(`${url}/api/category/list`)
                ]);
                if(resAlbum.data.success) setAlbumData(resAlbum.data.albums);
                if(resArtist.data.success) setArtistData(resArtist.data.artists);
                if(resCat.data.success) setCategoryData(resCat.data.categories);
            } catch (error) {
                console.error(error);
                toast.error("Lỗi cập nhật");
            }
        };
        loadOptions();
    }, [url]);

    // Format Options
    const artistOptions = artistData.map(item => ({ value: item._id, label: item.name }));
    const albumOptions = albumData.map(item => ({ value: item._id, label: item.title }));
    const categoryOptions = categoryData.map(item => ({ value: item._id, label: item.name }));

    const selectedArtist = artistOptions.find(op => op.value === artist) || null;
    const selectedAlbum = albumOptions.find(op => op.value === album) || null;
    const selectedCategory = categoryOptions.find(op => op.value === category) || null;

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        setAudio(file);
        if(file) {
            const audioObj = new Audio(URL.createObjectURL(file));
            audioObj.onloadedmetadata = () => setDuration(Math.floor(audioObj.duration));
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("id", editingId);
            
            
            formData.append("title", name);       
            formData.append("description", desc); 
           

            formData.append("album", album);
            formData.append("artist", artist);
            formData.append("category", category);
            formData.append("duration", duration);

            // Chỉ gửi file nếu người dùng chọn file mới
            if(image) formData.append("image", image);
            if(audio) formData.append("audio", audio);

            const response = await axios.post(`${url}/api/song/update`, formData);
            if (response.data.success) {
                toast.success("Cập nhật thành công");
                await fetchSongs();
                setView('list');
            } else { toast.error(response.data.message); }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật");
        }
        setLoading(false);
    }

    return (
        <div className="w-full pb-10">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <button type="button" onClick={() => setView('list')} className="flex items-center text-sm font-semibold text-[#737687] hover:text-[#0f62fe] transition-colors mb-2">
                        <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
                        Quay lại danh sách
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Cập nhật Bài Hát</h1>
                    <p className="text-sm text-[#737687]">Chỉnh sửa siêu dữ liệu (metadata) hoặc tệp âm thanh.</p>
                </div>
            </div>

            <form onSubmit={onSubmitHandler} className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="lg:col-span-2 w-full lg:w-2/3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-[#e1e1ee] overflow-hidden">
                        <div className="p-5 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/30">
                            <h2 className="text-base font-bold text-[#191b24]">Source Audio</h2>
                            <span className="bg-[#ecedfa] text-[#737687] text-xs font-bold px-2 py-1 rounded">Tùy chọn</span>
                        </div>
                        <div className="p-6 relative group">
                             <input
                                onChange={(e) => setAudio(e.target.files[0])}
                                type="file"
                                id="audio"
                                accept="audio/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-[#c3c6d8] rounded-lg p-8 flex flex-col items-center justify-center bg-[#faf8ff] group-hover:bg-[#f2f3ff] group-hover:border-[#0f62fe] transition-all text-center">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 border border-[#e1e1ee] text-[#0f62fe] group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[24px]">audio_file</span>
                                </div>
                                <p className="text-sm font-bold text-[#191b24] mb-1">
                                    {audio ? audio.name : "Click hoặc Kéo thả để cập nhật Audio mới"}
                                </p>
                                <p className="text-xs text-[#737687]">Bỏ trống nếu muốn giữ bản thu âm cũ.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-[#e1e1ee] overflow-hidden">
                        <div className="p-5 border-b border-[#e1e1ee] bg-[#f2f3ff]/30">
                            <h2 className="text-base font-bold text-[#191b24]">Track Metadata</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-semibold text-[#191b24] mb-2">Ảnh bìa (Artwork)</label>
                                <div className="relative group w-full aspect-square border-2 border-dashed border-[#c3c6d8] rounded-lg bg-[#faf8ff] hover:bg-[#f2f3ff] hover:border-[#0f62fe] transition-all flex flex-col items-center justify-center overflow-hidden">
                                     <input
                                        onChange={(e) => setImage(e.target.files[0])}
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <img src={image ? URL.createObjectURL(image) : (songData?.imageUrl || "")} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white mb-1">cloud_upload</span>
                                        <span className="text-white text-xs font-bold">Cập nhật ảnh</span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Tên bài hát</label>
                                    <input
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        type="text"
                                        required
                                        className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm text-[#191b24] focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none transition-all placeholder:text-[#737687]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#191b24] mb-2">Gán Nghệ sĩ</label>
                                        <Select
                                            value={selectedArtist}
                                            options={artistOptions}
                                            onChange={(opt) => setArtist(opt ? opt.value : "")}
                                            placeholder="Chọn nghệ sĩ..."
                                            isClearable
                                            className="text-sm custom-react-select"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#191b24] mb-2">Gán Album</label>
                                        <Select
                                            value={selectedAlbum}
                                            options={albumOptions}
                                            onChange={(opt) => setAlbum(opt ? opt.value : "none")}
                                            placeholder="Chọn album..."
                                            isClearable
                                            className="text-sm custom-react-select"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Thể loại (Category)</label>
                                    <Select
                                        value={selectedCategory}
                                        options={categoryOptions}
                                        onChange={(opt) => setCategory(opt ? opt.value : "")}
                                        placeholder="Chọn thể loại..."
                                        isClearable
                                        className="text-sm custom-react-select"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Mô tả</label>
                                    <input
                                        onChange={(e) => setDesc(e.target.value)}
                                        value={desc}
                                        type="text"
                                        className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm text-[#191b24] focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
                    <div className="space-y-3 bg-white p-6 rounded-xl shadow-sm border border-[#e1e1ee]">
                        <h3 className="font-bold text-[#191b24] mb-2">Hành động</h3>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#006e2d] text-white font-bold rounded-lg shadow-md shadow-[#006e2d]/20 hover:bg-[#005c25] transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">save</span>
                            )}
                            {loading ? "Đang xử lý..." : "Lưu Thay Đổi"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className="w-full py-2.5 bg-transparent border border-[#c3c6d8] text-[#191b24] font-semibold rounded-lg hover:bg-[#faf8ff] transition-all"
                        >
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditSong;