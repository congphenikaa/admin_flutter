import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select'; // 1. Import thư viện

const AddSong = ({ setView, fetchSongs }) => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const [loading, setLoading] = useState(false);
    
    // State lưu ID (vẫn giữ nguyên logic lưu ID vào DB)
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [album, setAlbum] = useState("none");
    const [artist, setArtist] = useState("");
    const [category, setCategory] = useState("");
    const [duration, setDuration] = useState(0);

    const [image, setImage] = useState(false);
    const [audio, setAudio] = useState(false);

    // State lưu dữ liệu gốc để map vào Select
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

    // 2. CHUYỂN ĐỔI DỮ LIỆU SANG FORMAT CỦA REACT-SELECT
    const artistOptions = artistData.map(item => ({ value: item._id, label: item.name }));
    const albumOptions = albumData.map(item => ({ value: item._id, label: item.title })); 
    const categoryOptions = categoryData.map(item => ({ value: item._id, label: item.name }));

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
            formData.append("title", name);
            formData.append("description", desc);
            formData.append("image", image);
            formData.append("audio", audio);
            formData.append("album", album); 
            formData.append("artist", artist); 
            formData.append("category", category); 
            formData.append("duration", duration);

            const response = await axios.post(`${url}/api/song/add`, formData);

            if (response.data.success) {
                toast.success("Thêm thành công");
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
                    <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Thêm Bài Hát (Manual Upload)</h1>
                    <p className="text-sm text-[#737687]">Tải nhạc trực tiếp lên hệ thống quản trị.</p>
                </div>
            </div>

            <form onSubmit={onSubmitHandler} className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="lg:col-span-2 w-full lg:w-2/3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-[#e1e1ee] overflow-hidden">
                        <div className="p-5 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/30">
                            <h2 className="text-base font-bold text-[#191b24]">Source Audio</h2>
                            <span className="bg-[#e7e7f4] text-[#424656] text-xs font-bold px-2 py-1 rounded">Bắt buộc</span>
                        </div>
                        <div className="p-6 relative group">
                             <input
                                onChange={(e) => setAudio(e.target.files[0])}
                                type="file"
                                id="audio"
                                accept="audio/*"
                                required
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-[#c3c6d8] rounded-lg p-10 flex flex-col items-center justify-center bg-[#faf8ff] group-hover:bg-[#f2f3ff] group-hover:border-[#0f62fe] transition-all text-center">
                                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-[#e1e1ee] text-[#0f62fe] group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[28px]">audio_file</span>
                                </div>
                                <p className="text-base font-bold text-[#191b24] mb-1">
                                    {audio ? audio.name : "Kéo thả file Audio vào đây"}
                                </p>
                                <p className="text-xs text-[#737687]">
                                    {audio ? "Click để đổi file khác" : "Hỗ trợ WAV, FLAC, hoặc MP3 (Tối đa 50MB)"}
                                </p>
                                {audio && duration > 0 && (
                                    <p className="inline-flex items-center mt-3 px-3 py-1 rounded-full bg-[#f2f3ff] text-xs font-semibold text-[#0f62fe] border border-[#b4c5ff]">
                                        <span className="material-symbols-outlined text-[14px] mr-1">timer</span>
                                        Thời lượng: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                                    </p>
                                )}
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
                                        required
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {image ? (
                                        <img src={URL.createObjectURL(image)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[#c3c6d8] text-[32px] mb-2 group-hover:text-[#0f62fe] transition-colors">add_photo_alternate</span>
                                            <span className="text-xs font-semibold text-[#737687] group-hover:text-[#0f62fe] transition-colors">Tải ảnh lên (1:1)</span>
                                        </>
                                    )}
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
                                        placeholder="Nhập tên bài hát..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#191b24] mb-2">Gán Nghệ sĩ</label>
                                        <Select
                                            options={artistOptions}
                                            onChange={(opt) => setArtist(opt ? opt.value : "")}
                                            placeholder="Chọn nghệ sĩ..."
                                            isClearable
                                            isLoading={artistData.length === 0}
                                            className="text-sm custom-react-select"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#191b24] mb-2">Gán Album</label>
                                        <Select
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
                                        options={categoryOptions}
                                        onChange={(opt) => setCategory(opt ? opt.value : "")}
                                        placeholder="Chọn thể loại..."
                                        isClearable
                                        className="text-sm custom-react-select"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Mô tả (Tùy chọn)</label>
                                    <input
                                        onChange={(e) => setDesc(e.target.value)}
                                        value={desc}
                                        type="text"
                                        className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm text-[#191b24] focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none transition-all placeholder:text-[#737687]"
                                        placeholder="Nhập mô tả ngắn gọn..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-[#006e2d]/30 overflow-hidden bg-gradient-to-r from-white to-[#e6f4ea]/30">
                         <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#006e2d] border border-[#006e2d]/20 shadow-sm">
                                    <span className="material-symbols-outlined">security_update_good</span>
                                </div>
                                <div>
                                    <p className="text-base font-bold text-[#191b24]">Bypass AI Moderation</p>
                                    <p className="text-xs text-[#424656]">Bài hát sẽ được tự động Publish (Dành cho bản quyền an toàn)</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-[#c3c6d8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006e2d]"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
                    <div className="space-y-3 bg-white p-6 rounded-xl shadow-sm border border-[#e1e1ee]">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#0f62fe] text-white font-bold rounded-lg shadow-md shadow-[#0f62fe]/20 hover:bg-[#004ccd] transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                            )}
                            {loading ? "Đang xử lý..." : "Lưu & Tải Lên Hệ Thống"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className="w-full py-2.5 bg-transparent border border-[#c3c6d8] text-[#191b24] font-semibold rounded-lg hover:bg-[#faf8ff] transition-all"
                        >
                            Hủy bỏ
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-[#e1e1ee] overflow-hidden">
                        <div className="p-4 border-b border-[#e1e1ee] bg-[#f2f3ff]/30 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#0f62fe] text-[20px]">info</span>
                            <h3 className="font-bold text-[#191b24] text-sm">Tiêu chuẩn Hệ thống</h3>
                        </div>
                        <div className="p-5">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-[#424656]">
                                    <span className="material-symbols-outlined text-[#0f62fe] text-[18px] mt-0.5">check_circle</span>
                                    <span>Định dạng Lossless (.wav, .flac) được ưu tiên để giữ chất lượng.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-[#424656]">
                                    <span className="material-symbols-outlined text-[#0f62fe] text-[18px] mt-0.5">check_circle</span>
                                    <span>Ảnh bìa tối thiểu 3000x3000px, bắt buộc tỉ lệ 1:1.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-[#424656]">
                                    <span className="material-symbols-outlined text-[#0f62fe] text-[18px] mt-0.5">check_circle</span>
                                    <span>Đảm bảo bạn có đầy đủ quyền sở hữu tác phẩm khi Bypass AI.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AddSong;