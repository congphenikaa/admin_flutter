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
        <div className="w-full h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-[#e1e1ee] flex justify-between items-center bg-[#f2f3ff]/50 shrink-0">
                <h2 className="text-xl font-bold text-[#191b24]">Thêm Thể loại</h2>
                <button onClick={() => setView('list')} className="text-[#737687] hover:bg-[#ecedfa] p-1.5 rounded-md transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>

            {/* Form Body (Scrollable) */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Image Upload Area */}
                <div>
                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Category Thumbnail</label>
                    <div className="relative group">
                        <input
                            type="file"
                            id="imageUpload"
                            required
                            onChange={(e) => setImage(e.target.files[0])}
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-[#c3c6d8] rounded-lg p-8 flex flex-col items-center justify-center bg-[#faf8ff] group-hover:bg-[#f2f3ff] group-hover:border-[#0f62fe] transition-all">
                            {image ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-md overflow-hidden border border-[#e1e1ee] mb-3 shadow-sm">
                                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs font-medium text-[#0f62fe]">Change image</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-[#0f62fe] text-[24px]">cloud_upload</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#191b24] mb-1">Click or drag to upload</p>
                                    <p className="text-[11px] text-[#737687]">PNG, JPG up to 2MB. Aspect ratio 1:1 recommended.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Name */}
                <div>
                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Category Name</label>
                    <input
                        className="w-full border border-[#c3c6d8] rounded-md py-2.5 px-3 text-sm text-[#191b24] focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none transition-all placeholder:text-[#737687]"
                        type="text"
                        required
                        placeholder="e.g. Synthwave"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                    />
                </div>

                {/* Color Theme */}
                <div>
                    <label className="block text-sm font-semibold text-[#191b24] mb-2">Theme Color</label>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['#191b24', '#0f62fe', '#006e2d', '#c84000', '#ba1a1a', '#b600f8', '#1db954'].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setColor(preset)}
                                className={`w-full aspect-square rounded-md shadow-sm border-2 ${color === preset ? 'border-[#191b24] scale-110' : 'border-transparent hover:scale-105'} transition-transform`}
                                style={{ backgroundColor: preset }}
                            ></button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-md border border-[#c3c6d8] shadow-inner overflow-hidden cursor-pointer shrink-0">
                            <input type="color" className="absolute inset-[-10px] w-20 h-20 cursor-pointer" value={color} onChange={(e)=>setColor(e.target.value)} />
                        </div>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737687] font-mono text-sm">#</span>
                            <input className="w-full border border-[#c3c6d8] rounded-md py-2.5 pl-7 pr-3 font-mono text-sm uppercase focus:ring-2 focus:ring-[#0f62fe]/20 focus:border-[#0f62fe] outline-none transition-all text-[#191b24]" type="text" value={color.replace('#', '')} onChange={(e) => setColor('#' + e.target.value)} maxLength={6} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#e1e1ee] flex gap-3 bg-[#faf8ff] shrink-0">
                <button type="button" onClick={() => setView('list')} className="flex-1 py-2.5 bg-white border border-[#c3c6d8] rounded-md text-[#424656] text-sm font-semibold hover:bg-[#f2f3ff] transition-colors">
                    Cancel
                </button>
                <button type="button" onClick={onSubmitHandler} disabled={loading} className="flex-1 py-2.5 bg-[#0f62fe] text-white rounded-md text-sm font-semibold shadow-sm hover:bg-[#004ccd] transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading ? 'Saving...' : 'Save Category'}
                </button>
            </div>
        </div>
    );
};

export default AddCategory;