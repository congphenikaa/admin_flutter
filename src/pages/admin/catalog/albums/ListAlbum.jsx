import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListAlbum = ({ albums, fetchAlbums, setEditingAlbum, setView, url, startIndex = 0 }) => {

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
    };

    return (
        <div className='w-full overflow-x-auto'>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] w-12 text-center">#</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Album</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Mô tả</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Ngày phát hành</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {albums && albums.length > 0 ? (
                        albums.map((item, index) => (
                            <tr key={index} className="hover:bg-[#faf8ff] transition-colors group">
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#737687] font-medium text-center">{startIndex + index + 1}</td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee]">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt="" className="w-12 h-12 object-cover rounded shadow-sm border border-[#e1e1ee]" />
                                        <div>
                                            <p className="font-semibold text-[#191b24] text-sm mb-0.5">{item.title}</p>
                                            <p className="text-xs text-[#0f62fe] font-medium">{item.artist ? item.artist.name : "Đã xóa"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656] max-w-[200px] truncate">
                                    {item.description}
                                </td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656]">
                                    {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString('vi-VN') : ""}
                                </td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-right">
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-[#737687] hover:text-[#0f62fe] hover:bg-[#ecedfa] rounded transition-colors" title="Sửa">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button onClick={() => removeAlbum(item._id)} className="p-1.5 text-[#737687] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors" title="Xóa">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="p-8 text-center text-[#737687] text-sm">Chưa có dữ liệu album.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ListAlbum;