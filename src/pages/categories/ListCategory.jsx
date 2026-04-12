import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListCategory = ({ categories, fetchCategories, setEditingCategory, setView, url, startIndex = 0 }) => {

    const removeCategory = async (id) => {
        if(!window.confirm("Bạn chắc chắn muốn xóa?")) return;
        try {
            const response = await axios.post(`${url}/api/category/remove`, { id });
            if (response.data.success) {
                toast.success("Đã xóa thành công");
                fetchCategories();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xóa");
        }
    };

    const handleEdit = (item) => {
        setEditingCategory(item);
        setView('edit');
    }

    return (
        <div className='w-full'>
            <div className="flex justify-between items-center mb-5">
                <h2 className='text-2xl font-bold'>Quản lý Thể loại</h2>
                <button onClick={() => setView('add')} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                    + Thêm Thể loại
                </button>
            </div>

            <div className='bg-white p-6 rounded shadow-md overflow-x-auto'>
                {/* Đặt min-width để tránh vỡ layout trên mobile */}
                <div className="min-w-[800px]">
                    {/* Thêm cột STT vào Grid */}
                    <div className='grid grid-cols-[0.3fr_0.5fr_2fr_1fr_1fr] gap-4 border-b pb-2 bg-gray-100 p-2 font-bold'>
                        <p>STT</p>
                        <p>Ảnh</p>
                        <p>Tên Thể loại</p>
                        <p>Màu sắc</p>
                        <p className='text-center'>Hành động</p>
                    </div>

                    {categories?.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Không tìm thấy thể loại nào.
                        </div>
                    ) : (
                        categories?.map((item, index) => (
                            <div key={item._id || index} className='grid grid-cols-[0.3fr_0.5fr_2fr_1fr_1fr] gap-4 items-center border-b p-2 hover:bg-gray-50'>
                                {/* Hiển thị Số Thứ Tự */}
                                <p className="font-medium text-gray-500 pl-1">{startIndex + index + 1}</p>
                                
                                <img src={item.image} alt="" className='w-12 h-12 object-cover rounded' />
                                <p className='font-medium'>{item.name}</p>
                                
                                {/* Hiển thị màu sắc trực quan */}
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-500">{item.color}</span>
                                </div>

                                <div className='flex gap-3 justify-center'>
                                    <p onClick={() => handleEdit(item)} className='cursor-pointer text-blue-600 font-semibold hover:underline'>Sửa</p>
                                    <p onClick={() => removeCategory(item._id)} className='cursor-pointer text-red-600 font-semibold hover:underline'>Xóa</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListCategory;