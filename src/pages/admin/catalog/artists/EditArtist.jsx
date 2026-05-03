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
    const [verified, setVerified] = useState(artistData.verified || false);



    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("id", artistData._id); // Quan trọng: Phải gửi ID để biết sửa ai
            formData.append("name", name);
            formData.append("bio", bio);
            formData.append("verified", verified);
            
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
        <div className="w-full h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/50 shrink-0">
                <h2 className="text-xl font-bold text-[#191b24]">Cập nhật Nghệ sĩ</h2>
                <button onClick={() => setView('list')} className="text-[#737687] hover:bg-[#ecedfa] p-1.5 rounded-md transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>

            {/* Form Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">

                {/* Verified Badge Toggle Component */}
                <div className="p-4 rounded-lg border border-[#b4c5ff] bg-[#f2f3ff]/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0f62fe] border border-[#b4c5ff] shadow-sm">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#191b24]">Cấp Tích Xanh (Verified)</p>
                            <p className="text-[11px] text-[#0f62fe] font-medium">Nổi bật nghệ sĩ trên hệ thống</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={verified} onChange={() => setVerified(!verified)} />
                        <div className="w-11 h-6 bg-[#c3c6d8] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0f62fe]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f62fe]"></div>
                    </label>
                </div>

                {/* Circular Avatar Upload */}
                <div>
                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Ảnh đại diện (Avatar)</label>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c3c6d8] rounded-lg bg-[#faf8ff] hover:bg-[#f2f3ff] hover:border-[#0f62fe] transition-all relative group">
                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#e1e1ee] shadow-md mb-2 relative">
                            <img src={image ? URL.createObjectURL(image) : preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-semibold text-[#0f62fe] mb-1">Click để thay đổi ảnh</p>
                    </div>
                </div>

                {/* Artist Name */}
                <div>
                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Tên nghệ sĩ</label>
                    <input
                        className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm text-[#191b24] focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none transition-all placeholder:text-[#737687]"
                        type="text"
                        required
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                    />
                </div>

                {/* Bio Textarea */}
                <div>
                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Tiểu sử (Bio)</label>
                    <textarea
                        className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm text-[#191b24] focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none transition-all placeholder:text-[#737687]"
                        rows={4}
                        value={bio}
                        onChange={(e)=>setBio(e.target.value)}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#e1e1ee] flex gap-3 bg-[#faf8ff] shrink-0">
                <button type="button" onClick={() => setView('list')} className="flex-1 py-2.5 bg-white border border-[#c3c6d8] rounded-md text-[#424656] text-sm font-semibold hover:bg-[#f2f3ff] transition-colors">
                    Hủy bỏ
                </button>
                <button type="button" onClick={onSubmitHandler} disabled={loading} className="flex-1 py-2.5 bg-[#0f62fe] text-white rounded-md text-sm font-semibold shadow-sm hover:bg-[#004ccd] transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading ? 'Đang cập nhật...' : 'Cập nhật Nghệ sĩ'}
                </button>
            </div>
        </div>
    );
};

export default EditArtist;