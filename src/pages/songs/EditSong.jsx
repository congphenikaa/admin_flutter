import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const EditSong = ({ setView, fetchSongs, editingId, songs }) => {
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [album, setAlbum] = useState("none");
    
    // Load data cũ khi mở form sửa
    useEffect(() => {
        // Tìm bài hát trong danh sách songs được truyền từ cha xuống
        const songToEdit = songs.find(s => s._id === editingId);
        if(songToEdit) {
            setName(songToEdit.title);
            setDesc(songToEdit.description);
            setAlbum(songToEdit.album || "none");
        }
    }, [editingId, songs]);

    const onEditHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/api/song/update`, {
                id: editingId,
                title: name,
                description: desc,
                album
            });
            if(res.data.success) {
                toast.success("Cập nhật xong!");
                fetchSongs(); // Refresh data
                setView('list'); // Quay về
            } else {
                toast.error("Lỗi cập nhật");
            }
        } catch (error) {
            toast.error("Lỗi server");
        }
    }

    return (
        <div className='bg-white p-5 rounded shadow-md'>
            <button onClick={() => setView('list')} className='mb-4 text-gray-500 hover:text-black'>← Hủy bỏ</button>
            <h2 className='text-xl font-bold mb-4'>Chỉnh sửa thông tin</h2>
            <form onSubmit={onEditHandler} className='flex flex-col gap-4 max-w-lg'>
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tên bài hát" className='border p-2 rounded' required/>
                <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Mô tả" className='border p-2 rounded' required/>
                <button className='bg-blue-600 text-white py-2 rounded'>Lưu thay đổi</button>
            </form>
        </div>
    )
}

export default EditSong