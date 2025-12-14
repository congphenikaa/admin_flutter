import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets' // Chú ý đường dẫn assets

const AddSong = ({ setView, fetchSongs }) => {
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [album, setAlbum] = useState("none");
    const [image, setImage] = useState(false);
    const [song, setSong] = useState(false);
    const [loading, setLoading] = useState(false);

    const onAddHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('desc', desc);
            formData.append('image', image);
            formData.append('audio', song);
            formData.append('album', album);

            const res = await axios.post(`${backendUrl}/api/song/add`, formData);
            if (res.data.success) {
                toast.success("Thêm thành công!");
                fetchSongs(); // Load lại list ở cha
                setView('list'); // Quay về list
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Lỗi upload");
        }
        setLoading(false);
    }

    return (
        <div className='bg-white p-5 rounded shadow-md'>
            <button onClick={() => setView('list')} className='mb-4 text-gray-500 hover:text-black'>← Quay lại danh sách</button>
            <h2 className='text-xl font-bold mb-4'>Thêm bài hát mới</h2>
            
            {loading ? <p>Đang upload dữ liệu...</p> : 
            <form onSubmit={onAddHandler} className='flex flex-col gap-4 max-w-lg'>
                <div className='flex gap-4'>
                    <div>
                        <p className='text-sm mb-1'>Ảnh bìa</p>
                        <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='img' hidden required/>
                        <label htmlFor="img"><img src={image ? URL.createObjectURL(image) : assets.upload_area} className='w-20 cursor-pointer' alt=""/></label>
                    </div>
                    <div>
                        <p className='text-sm mb-1'>File nhạc</p>
                        <input onChange={(e)=>setSong(e.target.files[0])} type="file" id='audio' hidden required/>
                        <label htmlFor="audio"><img src={song ? assets.upload_added : assets.upload_song} className='w-20 cursor-pointer' alt=""/></label>
                    </div>
                </div>
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tên bài hát" className='border p-2 rounded' required/>
                <input value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Mô tả" className='border p-2 rounded' required/>
                <button className='bg-green-600 text-white py-2 rounded'>Lưu bài hát</button>
            </form>}
        </div>
    )
}

export default AddSong