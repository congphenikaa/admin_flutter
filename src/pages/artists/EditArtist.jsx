import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditArtist = ({ setView, fetchArtists, url, artistData }) => {
    const [loading, setLoading] = useState(false);
    
    // Khởi tạo state với dữ liệu của artist cần sửa
    const [name, setName] = useState(artistData.name || "");
    const [bio, setBio] = useState(artistData.bio || "");
    const [preview, setPreview] = useState(artistData.image || "");
    const [image, setImage] = useState(false);



    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("id", artistData._id); // Quan trọng: Phải gửi ID để biết sửa ai
            formData.append("name", name);
            formData.append("bio", bio);
            
            // Chỉ gửi ảnh nếu người dùng có chọn ảnh mới
            if (image) {
                formData.append("image", image);
            }

            const response = await axios.post(`${url}/api/artist/update`, formData);

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchArtists(); // Load lại danh sách mới
                setView('list'); // Quay về trang chủ
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi cập nhật");
        }
        setLoading(false);
    };

    return (
        <div className='w-full'>
            <div className="flex items-center gap-4 mb-5">
                 <button 
                    onClick={() => setView('list')} 
                    className="text-gray-500 hover:text-black font-semibold"
                >
                    &larr; Hủy bỏ
                </button>
                <h2 className='text-2xl font-bold'>Chỉnh sửa Nghệ sĩ</h2>
            </div>

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 bg-white p-6 rounded shadow-md max-w-[600px]'>
                
                {/* Khu vực hiển thị ảnh */}
                <div className='flex gap-4 items-center'>
                    <div className='flex flex-col gap-2 w-full'>
                        <label className='font-medium'>Ảnh đại diện</label>
                        <div className="flex items-center gap-4">
                            {/* Hiển thị ảnh cũ hoặc ảnh preview mới chọn */}
                            <img 
                                src={image ? URL.createObjectURL(image) : preview} 
                                alt="Preview" 
                                className="w-16 h-16 object-cover rounded-full border"
                            />
                            <input
                                className='border p-2 rounded flex-1'
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={(e) => setImage(e.target.files[0])}
                                type="file" 
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Để trống nếu muốn giữ ảnh cũ</p>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='font-medium'>Tên nghệ sĩ</label>
                    <input 
                        onChange={(e) => setName(e.target.value)} 
                        value={name} 
                        className='border p-2 rounded' 
                        type="text" 
                        required 
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='font-medium'>Tiểu sử (Bio)</label>
                    <textarea 
                        onChange={(e) => setBio(e.target.value)} 
                        value={bio} 
                        className='border p-2 rounded' 
                        rows={3} 
                    />
                </div>

                <button 
                    type='submit' 
                    className='bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700 disabled:bg-gray-400' 
                    disabled={loading}
                >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </form>
        </div>
    );
};

export default EditArtist;