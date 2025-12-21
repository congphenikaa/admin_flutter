import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListAlbum = ({ albums, fetchAlbums, setEditingAlbum, setView, url }) => {

    const removeAlbum = async (id) => {
        if(!window.confirm("Bạn có chắc chắn muốn xóa album này?")) return;
        try {
            const response = await axios.post(`${url}/api/album/remove`, { id });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchAlbums();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xóa");
        }
    };

    const handleEdit = (item) => {
        setEditingAlbum(item);
        setView('edit');
    }

    return (
        <div className='w-full'>
             <div className="flex justify-between items-center mb-5">
                <h2 className='text-2xl font-bold'>Quản lý Album</h2>
                <button onClick={() => setView('add')} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                    + Thêm Album
                </button>
            </div>

            <div className='bg-white p-6 rounded shadow-md overflow-x-auto'>
                {/* Grid 6 cột: Ảnh, Tên, Nghệ sĩ, Mô tả, Màu nền, Hành động */}
                <div className='hidden sm:grid grid-cols-[0.5fr_1fr_1fr_1.5fr_0.5fr_0.8fr] gap-4 border-b pb-2 bg-gray-100 p-2 font-bold min-w-[800px]'>
                    <p>Ảnh</p>
                    <p>Tên Album</p>
                    <p>Nghệ sĩ</p>
                    <p>Mô tả</p>
                    <p>Ngày phát hành</p>
                    <p className='text-center'>Hành động</p>
                </div>

                {albums?.length > 0 ? (
                    albums.map((item, index) => (
                        <div key={index} className='grid grid-cols-[0.5fr_1fr_1fr_1.5fr_0.5fr_0.8fr] gap-4 items-center border-b p-2 hover:bg-gray-50 min-w-[800px]'>
                            <img src={item.image} alt="" className='w-12 h-12 object-cover rounded' />
                            <p className='font-medium truncate'>{item.title}</p>
                            {/* Xử lý hiển thị tên nghệ sĩ */}
                            <p className='text-gray-600 truncate'>{item.artist ? item.artist.name : "Đã xóa"}</p>
                            <p className='text-sm text-gray-500 truncate'>{item.description}</p>
                            {/* Format ngày tháng đơn giản */}
                            <p className='text-sm'>{item.releaseDate ? item.releaseDate.split('T')[0] : ""}</p>
                            
                            <div className='flex gap-3 justify-center'>
                                <p onClick={() => handleEdit(item)} className='cursor-pointer text-blue-600 font-semibold'>Sửa</p>
                                <p onClick={() => removeAlbum(item._id)} className='cursor-pointer text-red-600 font-semibold'>Xóa</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-500">Chưa có album nào.</p>
                )}
            </div>
        </div>
    );
};

export default ListAlbum;