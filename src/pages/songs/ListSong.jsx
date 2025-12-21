import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListSong = ({ songs, fetchSongs, setView, setEditingId }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const removeSong = async (id) => {
        if(!window.confirm("Xóa bài hát này?")) return;
        try {
            const response = await axios.post(`${backendUrl}/api/song/remove`, { id });
            if (response.data.success) {
                toast.success("Đã xóa!");
                fetchSongs();
            } else { toast.error("Lỗi xóa"); }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật");
        }
    }

    const handleEdit = (id) => {
        setEditingId(id);
        setView('edit');
    }

    return (
        <div>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold'>Thư viện bài hát</h2>
                <button onClick={() => setView('add')} className='bg-black text-white px-4 py-2 rounded'>+ Thêm bài hát</button>
            </div>

            <div className='relative overflow-x-auto shadow-sm border rounded-lg bg-white'>
                {/* Header 6 cột */}
                <div className='hidden sm:grid grid-cols-[0.5fr_1.5fr_1fr_1fr_0.5fr_0.8fr] gap-2.5 p-3 bg-gray-100 font-bold border-b'>
                    <p>Ảnh</p>
                    <p>Tên bài</p>
                    <p>Nghệ sĩ</p>
                    <p>Album</p>
                    <p>Thời lượng</p>
                    <p className='text-center'>Hành động</p>
                </div>
                
                {songs.map((item, index) => (
                    <div key={index} className='grid grid-cols-[0.5fr_1.5fr_1fr_1fr_0.5fr_0.8fr] items-center gap-2.5 p-3 border-b hover:bg-gray-50'>
                        <img className='w-10 h-10 object-cover rounded' src={item.imageUrl} alt="" />
                        <p className='font-medium truncate'>{item.title}</p>
                        {/* Hiển thị tên Artist & Album từ populate */}
                        <p className='truncate text-gray-500'>{item.artist ? item.artist.name : "Unknown"}</p>
                        <p className='truncate text-gray-500'>{item.album ? item.album.title : "-"}</p>
                        <p className='text-sm'>{Math.floor(item.duration / 60)}:{item.duration % 60 < 10 ? `0${item.duration % 60}` : item.duration % 60}</p>
                        
                        <div className='flex justify-center gap-2'>
                            <p onClick={() => handleEdit(item._id)} className='cursor-pointer text-blue-600 font-bold'>Sửa</p>
                            <p onClick={() => removeSong(item._id)} className='cursor-pointer text-red-600 font-bold'>Xóa</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ListSong;