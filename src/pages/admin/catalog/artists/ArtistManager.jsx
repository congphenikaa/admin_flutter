import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import ListArtist from './ListArtist';
import AddArtist from './AddArtist';
import EditArtist from './EditArtist';

const ArtistManager = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    
    const [view, setView] = useState('list');
    const [editingArtist, setEditingArtist] = useState(null); 
    const [artists, setArtists] = useState([]);
    
    // --- Shared global search & pagination ---
    const { globalSearch } = useOutletContext();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const fetchArtists = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/artist/list`);
            if (response.data.success) {
                setArtists(response.data.artists);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải danh sách");
        }
    }, [url]);

    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    // --- FILTER USING globalSearch ---
    const safeArtists = Array.isArray(artists) ? artists : [];
    const filteredArtists = safeArtists.filter(artist => {
        const searchStr = globalSearch ? globalSearch.toLowerCase() : '';
        const targetName = artist.name;
        return targetName.toLowerCase().includes(searchStr);
    });

    const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentArtists = filteredArtists.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [globalSearch]);

    return (
        <div className="w-full relative">
            {/* Always visible: Header & List Wrapper */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Quản lý Nghệ sĩ</h1>
                    <p className="text-sm text-[#737687]">Quản lý hồ sơ các nghệ sĩ trên hệ thống.</p>
                </div>
                <button
                    onClick={() => setView('add')}
                    className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm Nghệ sĩ
                </button>
            </div>

            {/* Always visible: The List */}
            <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm flex flex-col">
                <div className="p-4 border-b border-[#e1e1ee] flex items-center gap-4 bg-[#f2f3ff]/30">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#737687] text-[18px]">filter_list</span>
                        <span className="text-sm font-semibold text-[#424656]">Bộ lọc:</span>
                    </div>
                    <select className="bg-white border border-[#c3c6d8] text-[#191b24] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0f62fe]">
                        <option value="All">Trạng thái: Tất cả</option>
                        <option value="Verified">Đã xác minh (Tích xanh)</option>
                    </select>
                </div>

                <div className="p-0">
                    <ListArtist
                        artists={currentArtists}
                        fetchArtists={fetchArtists}
                        setView={setView}
                        setEditingArtist={setEditingArtist}
                        url={url}
                        startIndex={(currentPage - 1) * itemsPerPage}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-[#e1e1ee] flex justify-between items-center bg-[#faf8ff] rounded-b-lg">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition">Trước</button>
                        <span className="text-sm font-medium text-[#737687]">Trang <strong className="text-[#191b24]">{currentPage}</strong> / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition">Sau</button>
                    </div>
                )}
            </div>

            {/* The Overlay & Drawer */}
            {(view === 'add' || view === 'edit') && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
                    <div className="absolute inset-0" onClick={() => setView('list')}></div>
                    <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-[slideInRight_0.3s_ease-out]">
                        {view === 'add' && <AddArtist setView={setView} fetchArtists={fetchArtists} url={url} />}
                        {view === 'edit' && editingArtist && <EditArtist key={editingArtist._id} setView={setView} fetchArtists={fetchArtists} url={url} artistData={editingArtist} />}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ArtistManager;