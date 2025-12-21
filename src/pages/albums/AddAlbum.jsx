import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

const AddAlbum = ({ setView, fetchAlbums, url }) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [image, setImage] = useState(false);
    
    // State chọn nghệ sĩ
    const [artistId, setArtistId] = useState(""); 
    const [artistList, setArtistList] = useState([]);

    // Load danh sách nghệ sĩ khi component được bật
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

    const artistOptions = artistList.map(artist => ({
        value: artist._id,
        label: artist.name
    }));

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("releaseDate", releaseDate);
            formData.append("artist", artistId);
            formData.append("image", image);

            const response = await axios.post(`${url}/api/album/add`, formData);

            if (response.data.success) {
                toast.success("Thêm Album thành công");
                await fetchAlbums();
                setView('list');
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
            <button onClick={() => setView('list')} className="mb-4 text-gray-500 font-bold">&larr; Quay lại</button>
            <h2 className='text-2xl font-bold mb-6'>Thêm Album Mới</h2>

            <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded shadow-md max-w-[600px] flex flex-col gap-4'>
                <div>
                    <label className='block font-medium mb-1'>Ảnh bìa</label>
                    <input type="file" required onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className='block font-medium mb-1'>Tên Album</label>
                        <input className='border p-2 rounded w-full' type="text" required value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Nhập tên..." />
                    </div>
                    <div>
                        <label className='block font-medium mb-1'>Nghệ sĩ</label>
                        <Select 
                            options={artistOptions}
                            onChange={(selectedOption) => setArtistId(selectedOption ? selectedOption.value : "")}
                            placeholder="Tìm kiếm nghệ sĩ..."
                            isClearable
                            isLoading={artistList.length === 0}
                        />
                    </div>
                </div>

                <div>
                    <label className='block font-medium mb-1'>Mô tả</label>
                    <textarea className='border p-2 rounded w-full' rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Nhập mô tả..." />
                </div>

                <div>
                    <label className='block font-medium mb-1'>Ngày phát hành</label>
                    <input className='border p-2 rounded w-full' type="date" required value={releaseDate} onChange={(e)=>setReleaseDate(e.target.value)} />
                </div>

                <button type='submit' className='bg-black text-white py-2 rounded mt-2' disabled={loading}>
                    {loading ? "Đang xử lý..." : "Thêm Album"}
                </button>
            </form>
        </div>
    );
};

export default AddAlbum;