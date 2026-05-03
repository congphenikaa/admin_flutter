import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListArtist = ({ artists, fetchArtists, setEditingArtist, setView, url, startIndex = 0 }) => {
    console.log("Dữ liệu nhận được ở ListArtist:", artists);
    
    const removeArtist = async (id) => {
        if(!window.confirm("Bạn chắc chắn muốn xóa?")) return;
        try {
            const response = await axios.post(`${url}/api/artist/remove`, { id });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchArtists();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xóa");
        }
    };

    const handleEdit = (item) => {
        setEditingArtist(item); 
        setView('edit');        
    }

    return (
        <div className='w-full overflow-x-auto'>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] w-12 text-center">#</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Nghệ sĩ</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Tiểu sử</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee]">Người theo dõi</th>
                        <th className="bg-[#f2f3ff] text-[#424656] text-[12px] font-semibold uppercase tracking-wider py-3 px-4 border-b border-[#e1e1ee] text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {artists && artists.length > 0 ? (
                        artists.map((item, index) => (
                            <tr key={index} className="hover:bg-[#faf8ff] transition-colors group">
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#737687] font-medium text-center">{startIndex + index + 1}</td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee]">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-full shadow-sm border border-[#e1e1ee]" />
                                        <p className="font-semibold text-[#191b24] text-sm">{item.name}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656] max-w-[250px] truncate">
                                    {item.bio || "Chưa có tiểu sử"}
                                </td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-sm text-[#424656]">
                                    {item.followersCount?.toLocaleString() || 0}
                                </td>
                                <td className="py-3 px-4 border-b border-[#e1e1ee] text-right">
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-[#737687] hover:text-[#0f62fe] hover:bg-[#ecedfa] rounded transition-colors" title="Sửa">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button onClick={() => removeArtist(item._id)} className="p-1.5 text-[#737687] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors" title="Xóa">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="p-8 text-center text-[#737687] text-sm">Chưa có dữ liệu nghệ sĩ.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ListArtist;