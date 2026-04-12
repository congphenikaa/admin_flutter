import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Đã nhận thêm biến startIndex để tính STT
const ListSong = ({ songs, fetchSongs, setView, setEditingId, startIndex = 0 }) => {
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
                <button onClick={() => setView('add')} className='bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800 transition'>+ Thêm bài hát</button>
            </div>

            <div className='relative overflow-x-auto shadow-sm border rounded-lg bg-white'>
                {/* Đặt min-width để tránh bị co rúm dữ liệu trên màn hình điện thoại */}
                <div className="min-w-[1000px]">
                    {/* Header 8 cột */}
                    <div className='grid grid-cols-[0.3fr_0.5fr_1.5fr_1fr_1fr_1fr_0.5fr_0.8fr] gap-2.5 p-3 bg-gray-100 font-bold border-b text-gray-700'>
                        <p>STT</p>
                        <p>Ảnh</p>
                        <p>Tên bài</p>
                        <p>Nghệ sĩ</p>
                        <p>Album</p>
                        <p>Thể loại</p>
                        <p>Thời lượng</p>
                        <p className='text-center'>Hành động</p>
                    </div>
                    
                    {songs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Không tìm thấy bài hát nào.
                        </div>
                    ) : (
                        songs.map((item, index) => {
                            // --- XỬ LÝ AN TOÀN HIỂN THỊ CATEGORY ---
                            let displayCategory = "-";
                            if (item.category) {
                                // Trường hợp Backend populate dưới dạng mảng (VD: theo cấu trúc EditSong.jsx của bạn)
                                if (Array.isArray(item.category) && item.category.length > 0) {
                                    displayCategory = item.category.map(c => c.name || "Unknown").join(", ");
                                } 
                                // Trường hợp Object đơn
                                else if (item.category.name) {
                                    displayCategory = item.category.name;
                                }
                            }

                            return (
                                <div key={item._id || index} className='grid grid-cols-[0.3fr_0.5fr_1.5fr_1fr_1fr_1fr_0.5fr_0.8fr] items-center gap-2.5 p-3 border-b hover:bg-gray-50 transition'>
                                    {/* Hiển thị Số thứ tự */}
                                    <p className="font-medium text-gray-500 pl-1">{startIndex + index + 1}</p>
                                    
                                    <img className='w-10 h-10 object-cover rounded shadow-sm' src={item.imageUrl} alt={item.title} />
                                    
                                    <p className='font-medium truncate' title={item.title}>{item.title}</p>
                                    <p className='truncate text-gray-500' title={item.artist?.name}>{item.artist ? item.artist.name : "Unknown"}</p>
                                    <p className='truncate text-gray-500' title={item.album?.title}>{item.album ? item.album.title : "-"}</p>
                                    
                                    {/* Hiển thị Thể loại */}
                                    <p className='truncate text-gray-500' title={displayCategory}>
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs border border-blue-100">
                                            {displayCategory}
                                        </span>
                                    </p>
                                    
                                    <p className='text-sm text-gray-600'>{Math.floor(item.duration / 60)}:{item.duration % 60 < 10 ? `0${item.duration % 60}` : item.duration % 60}</p>
                                    
                                    <div className='flex justify-center gap-3'>
                                        <button onClick={() => handleEdit(item._id)} className='cursor-pointer text-blue-600 font-bold hover:underline'>Sửa</button>
                                        <button onClick={() => removeSong(item._id)} className='cursor-pointer text-red-600 font-bold hover:underline'>Xóa</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default ListSong;