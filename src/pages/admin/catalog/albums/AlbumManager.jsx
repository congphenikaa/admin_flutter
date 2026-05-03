import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import ListAlbum from './ListAlbum';
import AddAlbum from './AddAlbum';
import EditAlbum from './EditAlbum';

const AlbumManager = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const [view, setView] = useState('list');
    const [albums, setAlbums] = useState([]);
    const [editingAlbum, setEditingAlbum] = useState(null);

    // --- Shared global search & pagination ---
    const { globalSearch } = useOutletContext();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchAlbums = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            if (response.data.success) {
                setAlbums(response.data.albums);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách Album");
        }
    }, [url]);

    useEffect(() => {
        fetchAlbums();
    }, [fetchAlbums]);

    // --- FILTER USING globalSearch ---
    const safeAlbums = Array.isArray(albums) ? albums : [];
    const filteredAlbums = safeAlbums.filter(album => {
        const searchStr = globalSearch ? globalSearch.toLowerCase() : '';
        const targetName = album.title;
        const targetDesc = album.description;

        return targetName.toLowerCase().includes(searchStr) ||
               targetDesc.toLowerCase().includes(searchStr);
    });

    const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAlbums = filteredAlbums.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [globalSearch]);

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Quản lý Album</h1>
                    <p className="text-sm text-[#737687]">Bộ sưu tập các album và EP trên hệ thống.</p>
                </div>
                {view === 'list' && (
                    <button onClick={() => setView('add')} className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Thêm Album
                    </button>
                )}
            </div>

            {view === 'list' && (
                <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm flex flex-col">
                    <div className="p-4 border-b border-[#e1e1ee] flex items-center gap-4 bg-[#f2f3ff]/30">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#737687] text-[18px]">filter_list</span>
                            <span className="text-sm font-semibold text-[#424656]">Bộ lọc:</span>
                        </div>
                        <select className="bg-white border border-[#c3c6d8] text-[#191b24] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0f62fe]">
                            <option value="All">Mọi khoảng thời gian</option>
                            <option value="New">Phát hành năm nay</option>
                        </select>
                    </div>

                    <div className="p-0">
                        <ListAlbum albums={currentAlbums} fetchAlbums={fetchAlbums} setView={setView} setEditingAlbum={setEditingAlbum} url={url} startIndex={(currentPage - 1) * itemsPerPage} />
                    </div>

                    {totalPages > 1 && (
                        <div className="p-4 border-t border-[#e1e1ee] flex justify-between items-center bg-[#faf8ff] rounded-b-lg">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition">Trước</button>
                            <span className="text-sm font-medium text-[#737687]">Trang <strong className="text-[#191b24]">{currentPage}</strong> / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition">Sau</button>
                        </div>
                    )}
                </div>
            )}

            {view === 'add' && <AddAlbum setView={setView} fetchAlbums={fetchAlbums} url={url} />}
            {view === 'edit' && editingAlbum && <EditAlbum key={editingAlbum._id} setView={setView} fetchAlbums={fetchAlbums} url={url} albumData={editingAlbum} />}
        </div>
    )
}

export default AlbumManager;