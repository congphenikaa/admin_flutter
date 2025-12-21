import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddCategory = ({ setView, fetchCategories, url }) => {
   
    const [name, setName] = useState("");
    const [color, setColor] = useState("#000000");
    const [image, setImage] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("color", color);
            formData.append("image", image);

            const response = await axios.post(`${url}/api/category/add`, formData);

            if (response.data.success) {
                toast.success("Thêm thành công");
                fetchCategories();
                setView('list');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi thêm mới");
        }
        setLoading(false);
    };

    return (
        <div className='w-full'>
             <button onClick={() => setView('list')} className="mb-4 font-bold text-gray-500">&larr; Quay lại</button>
             <h2 className='text-2xl font-bold mb-6'>Thêm Thể loại</h2>
             
             <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded shadow-md max-w-[500px] flex flex-col gap-4'>
                <div>
                    <label className='block mb-2 font-medium'>Ảnh minh họa</label>
                    <input type="file" required onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                </div>

                <div>
                    <label className='block mb-2 font-medium'>Tên thể loại</label>
                    <input className='border p-2 w-full rounded' type="text" required value={name} onChange={(e)=>setName(e.target.value)} />
                </div>

                <div>
                    <label className='block mb-2 font-medium'>Màu chủ đạo</label>
                    <input type="color" className='h-10 w-20 cursor-pointer' value={color} onChange={(e)=>setColor(e.target.value)} />
                </div>

                <button type='submit' className='bg-black text-white py-2 rounded mt-2' disabled={loading}>Thêm mới</button>
             </form>
        </div>
    );
};

export default AddCategory;