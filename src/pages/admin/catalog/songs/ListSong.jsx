import React from 'react';
import api from '../../../../utils/api';
import { toast } from 'react-toastify';

// Đã nhận thêm biến startIndex để tính STT
const ListSong = ({ songs, fetchSongs, setView, setEditingId, startIndex = 0 }) => {

    const removeSong = async (id) => {
        if(!window.confirm("Xóa bài hát này?")) return;
        try {
            const response = await api.post(`/song/remove`, { id });
            if (response.data.success) {
                toast.success("Đã xóa!");
                fetchSongs();
            } else { toast.error("Lỗi xóa"); }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật");
        }
    }

    const handleEdit = (id) => {
        setEditingId(id);
        setView('edit');
    }

    return (
        <div className='w-full overflow-x-auto'>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] w-12 text-center">#</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Bài hát</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Ca sĩ</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Album</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Thể loại</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Thời lượng</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {songs && songs.length > 0 ? (
                        songs.map((item, index) => {
                            // Xử lý hiển thị category an toàn
                            let displayCategory = "-";
                            if (Array.isArray(item.category)) {
                                const names = item.category
                                    .map((c) => (typeof c === 'object' && c !== null ? (c.name || c.title || '') : String(c || '')))
                                    .filter(Boolean);
                                if (names.length > 0) displayCategory = names.join(', ');
                            } else if (typeof item.category === 'object' && item.category !== null) {
                                displayCategory = item.category.name || item.category.title || "-";
                            } else if (typeof item.category === 'string' && item.category.trim()) {
                                displayCategory = item.category;
                            }

                            return (
                                <tr key={index} className="hover:bg-[#faf8ff] transition-colors group">
                                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#737687] font-medium text-center">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="py-3 px-4 border-b border-[#e1e1ee]">
                                        <div className="flex items-center gap-3">
                                            <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded shadow-sm border border-[#e1e1ee]" />
                                            <p className="font-semibold text-[#191b24] text-sm max-w-[180px] truncate" title={item.title}>
                                                {item.title}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656] max-w-[120px] truncate" title={item.artist?.name}>
                                        {item.artist?.name || "Đã xóa"}
                                    </td>
                                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656] max-w-[120px] truncate" title={item.album?.title}>
                                        {item.album?.title || "-"}
                                    </td>
                                    <td className="py-3 px-4 border-b border-[#e1e1ee]">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f2f3ff] text-[#0f62fe] border border-[#b4c5ff] truncate max-w-[100px]" title={displayCategory}>
                                            {displayCategory}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656]">
                                        {Math.floor(item.duration / 60)}:{item.duration % 60 < 10 ? `0${item.duration % 60}` : item.duration % 60}
                                    </td>
                                    <td className="py-3 px-4 border-b border-[#e1e1ee] text-right">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(item._id)} className="p-1.5 text-[#737687] hover:text-[#0f62fe] hover:bg-[#ecedfa] rounded transition-colors" title="Sửa">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button onClick={() => removeSong(item._id)} className="p-1.5 text-[#737687] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors" title="Xóa">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="7" className="p-8 text-center text-[#737687] text-sm">Chưa có dữ liệu bài hát.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default ListSong;