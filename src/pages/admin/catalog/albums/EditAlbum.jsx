import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

const EditAlbum = ({ setView, fetchAlbums, url, albumData }) => {
    const [loading, setLoading] = useState(false);
    
    // Khởi tạo state từ props
    const [title, setTitle] = useState(albumData.title || "");
    const [description, setDescription] = useState(albumData.description || "");
    // Xử lý ngày: Chuyển ISO string sang YYYY-MM-DD
    const [releaseDate, setReleaseDate] = useState(albumData.releaseDate ? albumData.releaseDate.split('T')[0] : "");
    // Xử lý Artist: Lấy _id nếu có object
    const [artistId, setArtistId] = useState(albumData.artist ? albumData.artist._id : "");
    
    const [image, setImage] = useState(false);
    const [preview, setPreview] = useState(albumData.image || "");
    const [artistList, setArtistList] = useState([]);

    useEffect(() => {
        const loadArtists = async () => {
            try {
                const res = await axios.get(`${url}/api/artist/list`);
                if(res.data.success) setArtistList(res.data.artists);
            } catch(error) {
                console.error(error);
                toast.error("Lỗi tải danh sách nghệ sĩ"); 
            }
        }
        loadArtists();
    }, [url]);

    // 1. Tạo Options
    const artistOptions = artistList.map(artist => ({
        value: artist._id,
        label: artist.name
    }));

    // 2. Tìm Option đang được chọn (để hiển thị mặc định)
    const selectedArtistOption = artistOptions.find(op => op.value === artistId) || null;

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("id", albumData._id); // Gửi ID để biết sửa cái nào
            formData.append("title", title);
            formData.append("description", description);
            formData.append("releaseDate", releaseDate);
            formData.append("artist", artistId);
            if (image) formData.append("image", image);

            const response = await axios.post(`${url}/api/album/update`, formData);

            if (response.data.success) {
                toast.success("Cập nhật thành công");
                await fetchAlbums();
                setView('list');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi cập nhật");
        }
        setLoading(false);
    };

    return (
        <div className='w-full'>
            <button onClick={() => setView('list')} className="mb-4 text-gray-500 font-bold">&larr; Hủy bỏ</button>
            <h2 className='text-2xl font-bold mb-6'>Chỉnh sửa Album</h2>

            <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded shadow-md max-w-[600px] flex flex-col gap-4'>
                <div className="flex gap-4 items-center mb-4">
                    <img src={image ? URL.createObjectURL(image) : preview} alt="Preview" className="w-20 h-20 object-cover rounded shadow" />
                    <div>
                        <p className="font-medium text-sm mb-1">Ảnh bìa mới</p>
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block font-medium mb-1'>Tên Album</label>
                        <input className='border p-2 rounded w-full' type="text" required value={title} onChange={(e)=>setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className='block font-medium mb-1'>Nghệ sĩ</label>
                        <Select 
                            value={selectedArtistOption} // Quan trọng: Giá trị hiển thị
                            options={artistOptions}
                            onChange={(selected) => setArtistId(selected ? selected.value : "")}
                            placeholder="Tìm kiếm..."
                            isLoading={artistList.length === 0}
                        />
                    </div>
                </div>

                <div>
                    <label className='block font-medium mb-1'>Mô tả</label>
                    <textarea className='border p-2 rounded w-full' rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />
                </div>

                <div>
                    <label className='block font-medium mb-1'>Ngày phát hành</label>
                    <input className='border p-2 rounded w-full' type="date" required value={releaseDate} onChange={(e)=>setReleaseDate(e.target.value)} />
                </div>

                <button type='submit' className='bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700' disabled={loading}>
                    {loading ? "Lưu thay đổi..." : "Lưu thay đổi"}
                </button>
            </form>
        </div>
    );
};

export default EditAlbum;