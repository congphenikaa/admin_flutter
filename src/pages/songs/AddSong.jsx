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
        <div className='w-full'>
            <button onClick={() => setView('list')} className="mb-4 font-bold text-gray-500">&larr; Quay lại</button>
            <h2 className='text-2xl font-bold mb-6'>Thêm Bài hát</h2>
            
            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 bg-white p-6 rounded shadow max-w-[800px]'>
                <div className='flex gap-4'>
                    <div className='flex-1'>
                        <label className='block font-medium mb-1'>Tải ảnh bìa</label>
                        <input onChange={(e)=>setImage(e.target.files[0])} type="file" required accept="image/*" />
                    </div>
                    <div className='flex-1'>
                        <label className='block font-medium mb-1'>Tải file nhạc</label>
                        <input onChange={handleAudioChange} type="file" required accept="audio/*" />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <input className='border p-2 rounded' type="text" placeholder='Tên bài hát' required value={name} onChange={(e)=>setName(e.target.value)} />
                    <input className='border p-2 rounded' type="text" placeholder='Mô tả ngắn' required value={desc} onChange={(e)=>setDesc(e.target.value)} />
                </div>

                <div className='grid grid-cols-3 gap-4'>
                    <div>
                        <label className='block font-medium mb-1'>Album</label>
                        <Select 
                            options={albumOptions} 
                            onChange={(opt) => setAlbum(opt ? opt.value : "none")}
                            placeholder="Chọn Album..."
                            isClearable
                        />
                    </div>

                    <div>
                        <label className='block font-medium mb-1'>Nghệ sĩ</label>
                        <Select 
                            options={artistOptions} 
                            onChange={(opt) => setArtist(opt ? opt.value : "")}
                            placeholder="Tìm nghệ sĩ..."
                            isClearable
                            isLoading={artistData.length === 0}
                        />
                    </div>

                    <div>
                        <label className='block font-medium mb-1'>Thể loại</label>
                        <Select 
                            options={categoryOptions} 
                            onChange={(opt) => setCategory(opt ? opt.value : "")}
                            placeholder="Tìm thể loại..."
                            isClearable
                        />
                    </div>
                </div>
                
                <div className='text-sm text-gray-500'>Thời lượng: {Math.floor(duration / 60)}:{duration % 60}</div>

                <button type='submit' className='bg-black text-white py-2 rounded' disabled={loading}>
                    {loading ? "Đang xử lý..." : "Thêm Bài hát"}
                </button>
            </form>
        </div>
    )
}

export default AddSong;