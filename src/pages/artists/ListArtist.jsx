import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListArtist = ({ artists, fetchArtists,setEditingArtist, setView, url }) => {
    console.log("Dữ liệu nhận được ở ListArtist:", artists);
    const removeArtist = async (id) => {
        try {
            const response = await axios.post(`${url}/api/artist/remove`, { id });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchArtists();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xóa");
        }
    };

    const handleEdit = (item) => {
        setEditingArtist(item); 
        setView('edit');        
    }

    return (
        <div className='w-full'>
            <div className="flex justify-between items-center mb-5">
                <h2 className='text-2xl font-bold'>Danh sách Nghệ sĩ</h2>
                <button 
                    onClick={() => setView('add')} 
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    + Thêm Nghệ sĩ
                </button>
            </div>

            <div className='bg-white p-6 rounded shadow-md'>
                <div className='grid grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] gap-4 border-b pb-2 bg-gray-100 p-2 font-medium'>
                    <p>Ảnh</p>
                    <p>Tên</p>
                    <p>Bio</p>
                    <p>Followers</p>
                    <p>Hành động</p>
                </div>

                {artists?.length > 0 ? (
                    artists.map((item, index) => (
                        <div key={index} className='grid grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] gap-4 items-center border-b p-2 hover:bg-gray-50'>
                            <img src={item.image} alt="" className='w-12 h-12 object-cover rounded-full' />
                            <p className='font-medium'>{item.name}</p>
                            <p className='text-sm text-gray-500 truncate'>{item.bio || "Chưa có bio"}</p>
                            <p className='text-sm'>{item.followersCount}</p>
                            <div className='flex gap-2 justify-center'>
                                <p onClick={() => handleEdit(item)} className='cursor-pointer text-blue-500 hover:text-blue-700 font-bold text-center'>
                                    Sửa
                                </p>
                                <p onClick={() => removeArtist(item._id)} className='cursor-pointer text-red-500 hover:text-red-700 font-bold'>
                                    Xóa
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-500">Chưa có nghệ sĩ nào.</p>
                )}
            </div>
        </div>
    );
};

export default ListArtist;