import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditCategory = ({ setView, fetchCategories, url, categoryData }) => {
    const [loading, setLoading] = useState(false);
    
    // Khởi tạo state từ dữ liệu cũ
    const [name, setName] = useState(categoryData.name || "");
    const [color, setColor] = useState(categoryData.color || "#000000");
    const [image, setImage] = useState(false);
    const [preview, setPreview] = useState(categoryData.image || "");

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("id", categoryData._id);
            formData.append("name", name);
            formData.append("color", color);
            if (image) formData.append("image", image);

            const response = await axios.post(`${url}/api/category/update`, formData);

            if (response.data.success) {
                toast.success("Cập nhật thành công");
                await fetchCategories();
                setView('list');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật");
        }
        setLoading(false);
    };

    return (
        <div className='w-full'>
            <button onClick={() => setView('list')} className="mb-4 text-gray-500 font-bold">&larr; Hủy bỏ</button>
            <h2 className='text-2xl font-bold mb-6'>Sửa Thể loại</h2>

            <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded shadow-md max-w-[500px] flex flex-col gap-4'>
                
                <div className="flex gap-4 items-center">
                    <img src={image ? URL.createObjectURL(image) : preview} alt="" className="w-16 h-16 object-cover rounded" />
                    <div>
                        <label className='block font-medium mb-1'>Ảnh mới (Tùy chọn)</label>
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                    </div>
                </div>

                <div>
                    <label className='block font-medium mb-1'>Tên thể loại</label>
                    <input className='border p-2 rounded w-full' type="text" required value={name} onChange={(e)=>setName(e.target.value)} />
                </div>

                <div>
                    <label className='block font-medium mb-1'>Màu chủ đạo</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="color" 
                            className='h-10 w-20 cursor-pointer border rounded' 
                            value={color} 
                            onChange={(e)=>setColor(e.target.value)} 
                        />
                        <span className="text-gray-600">{color}</span>
                    </div>
                </div>

                <button type='submit' className='bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700' disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </form>
        </div>
    );
};

export default EditCategory;