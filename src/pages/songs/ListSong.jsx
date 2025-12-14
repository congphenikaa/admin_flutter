import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const ListSong = ({ songs, fetchSongs, setView, setEditingId }) => {
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [searchTerm, setSearchTerm] = useState("");

    const removeSong = async (id) => {
        if(!window.confirm("Bạn chắc chắn muốn xóa?")) return;
        try {
            const response = await axios.post(`${backendUrl}/api/song/remove`, { id });
            if (response.data.success) {
                toast.success("Đã xóa!");
                fetchSongs(); // Gọi hàm refresh từ cha
            }
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    }

    // Lọc bài hát
    const filteredSongs = songs.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold'>Thư viện bài hát</h2>
                <button onClick={() => setView('add')} className='bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800'>
                    + Thêm bài hát
                </button>
            </div>

            <input 
                type="text" 
                placeholder="🔍 Tìm kiếm bài hát..." 
                className="w-full border border-gray-300 p-2 mb-4 rounded outline-none focus:border-green-500"
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className='relative overflow-x-auto shadow-sm border rounded-lg bg-white'>
                <div className='hidden sm:grid grid-cols-[0.5fr_1.5fr_2fr_1fr_0.5fr_1.2fr] gap-2.5 p-3 bg-gray-100 font-bold border-b'>
                    <p>Ảnh</p>
                    <p>Tên</p>
                    <p>Mô tả</p>
                    <p>Album</p>
                    <p>Thời lượng</p>
                    <p className='text-center'>Hành động</p>
                </div>
                {filteredSongs.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[0.5fr_1.5fr_2fr_1fr_0.5fr_1.2fr] items-center gap-2.5 p-3 border-b hover:bg-gray-50'>
                        <img className='w-10 h-10 object-cover rounded' src={item.imageUrl} alt="" />
                        <p className='font-medium'>{item.title}</p>
                        <p className='truncate text-gray-500 text-sm'>{item.description}</p>
                        <p className='text-sm'>{item.album ? "Album" : "Single"}</p>
                        <p className='text-sm'>{Math.floor(item.duration / 60)}:{item.duration % 60 < 10 ? `0${item.duration % 60}` : item.duration % 60}</p>
                        <div className='flex justify-center gap-2'>
                            <button 
                                onClick={() => { setEditingId(item._id); setView('edit'); }} 
                                className='text-blue-600 border border-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-50'
                            >
                                Sửa
                            </button>
                            <button onClick={() => removeSong(item._id)} className='text-red-600 border border-red-600 px-2 py-1 rounded text-xs hover:bg-red-50'>Xóa</button>
                        </div>
                    </div>
                ))}
                {filteredSongs.length === 0 && <p className='p-4 text-center text-gray-500'>Không tìm thấy dữ liệu.</p>}
            </div>
        </div>
    )
}

export default ListSong