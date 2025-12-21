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
        <div className='w-full'>
            <button onClick={() => setView('list')} className="mb-4 font-bold text-gray-500">&larr; Hủy bỏ</button>
            <h2 className='text-2xl font-bold mb-6'>Sửa Bài Hát</h2>
            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 bg-white p-6 rounded shadow max-w-[800px]'>
                
                {/* --- [SỬA GIAO DIỆN]: Hiển thị Preview --- */}
                <div className='flex gap-4'>
                    {/* Phần Ảnh */}
                    <div className='flex-1 flex flex-col gap-2'>
                        <label className='block font-medium text-sm'>Ảnh bìa</label>
                        <div className="relative">
                            {/* Hiển thị ảnh mới (nếu chọn) HOẶC ảnh cũ */}
                            <img 
                                src={image ? URL.createObjectURL(image) : songData?.imageUrl} 
                                className="w-24 h-24 object-cover rounded border"
                                alt="preview"
                            />
                            {/* Nút nhỏ để báo hiệu upload */}
                            {!image && <span className="text-xs text-gray-500 mt-1 block">Ảnh hiện tại</span>}
                            {image && <span className="text-xs text-green-600 mt-1 block">Đã chọn ảnh mới</span>}
                        </div>
                        <input onChange={(e)=>setImage(e.target.files[0])} type="file" accept="image/*" className="text-sm"/>
                    </div>

                    {/* Phần Nhạc */}
                    <div className='flex-1 flex flex-col gap-2'>
                        <label className='block font-medium text-sm'>File Nhạc</label>
                        <div>
                             {/* Hiển thị audio mới (nếu chọn) HOẶC audio cũ */}
                            <audio controls src={audio ? URL.createObjectURL(audio) : songData?.audioUrl} className="w-full mb-2" />
                            {!audio && <span className="text-xs text-gray-500">File nhạc hiện tại</span>}
                            {audio && <span className="text-xs text-green-600">Đã chọn file mới</span>}
                        </div>
                        <input onChange={handleAudioChange} type="file" accept="audio/*" className="text-sm" />
                    </div>
                </div>
                {/* ------------------------------------------ */}

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block font-medium mb-1 text-sm'>Tên bài hát</label>
                        <input className='border p-2 rounded w-full' value={name} onChange={(e)=>setName(e.target.value)} />
                    </div>
                    <div>
                        <label className='block font-medium mb-1 text-sm'>Mô tả</label>
                        <input className='border p-2 rounded w-full' value={desc} onChange={(e)=>setDesc(e.target.value)} />
                    </div>
                </div>

                <div className='grid grid-cols-3 gap-4'>
                    <div>
                        <label className='block font-medium mb-1 text-sm'>Album</label>
                        <Select value={selectedAlbum} options={albumOptions} onChange={(opt) => setAlbum(opt ? opt.value : "none")} placeholder="Chọn Album" isClearable />
                    </div>
                    <div>
                        <label className='block font-medium mb-1 text-sm'>Nghệ sĩ</label>
                        <Select value={selectedArtist} options={artistOptions} onChange={(opt) => setArtist(opt ? opt.value : "")} placeholder="Chọn Nghệ sĩ" isClearable />
                    </div>
                    <div>
                        <label className='block font-medium mb-1 text-sm'>Thể loại</label>
                        <Select value={selectedCategory} options={categoryOptions} onChange={(opt) => setCategory(opt ? opt.value : "")} placeholder="Chọn Thể loại" isClearable />
                    </div>
                </div>
                
                <button type='submit' className='bg-green-600 text-white py-2 rounded mt-2' disabled={loading}>Lưu thay đổi</button>
            </form>
        </div>
    )
}

export default EditSong;