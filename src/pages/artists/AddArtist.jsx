import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddArtist = ({ setView, fetchArtists, url }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("bio", bio);
            formData.append("image", image);

            const response = await axios.post(`${url}/api/artist/add`, formData);

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchArtists(); // Cập nhật lại list ở cha
                setView('list'); // Quay về trang list
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra");
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
                    &larr; Quay lại
                </button>
                <h2 className='text-2xl font-bold'>Thêm Nghệ sĩ mới</h2>
            </div>

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 bg-white p-6 rounded shadow-md max-w-[600px]'>
                <div className='flex gap-4 items-center'>
                    <div className='flex flex-col gap-2 w-full'>
                        <label className='font-medium'>Ảnh đại diện</label>
                        <input
                            className='border p-2 rounded'
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={(e) => setImage(e.target.files[0])}
                            type="file" required 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='font-medium'>Tên nghệ sĩ</label>
                    <input 
                        onChange={(e) => setName(e.target.value)} 
                        value={name} 
                        className='border p-2 rounded' 
                        type="text" 
                        placeholder='Nhập tên...' 
                        required 
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='font-medium'>Tiểu sử (Bio)</label>
                    <textarea 
                        onChange={(e) => setBio(e.target.value)} 
                        value={bio} 
                        className='border p-2 rounded' 
                        placeholder='Nhập tiểu sử...' 
                        rows={3} 
                    />
                </div>

                <button 
                    type='submit' 
                    className='bg-black text-white py-2 rounded mt-2 hover:bg-gray-800 disabled:bg-gray-400' 
                    disabled={loading}
                >
                    {loading ? "Đang xử lý..." : "Thêm Nghệ sĩ"}
                </button>
            </form>
        </div>
    );
};

export default AddArtist;