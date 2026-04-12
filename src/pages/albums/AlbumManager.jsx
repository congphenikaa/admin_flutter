import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ListAlbum from './ListAlbum';
import AddAlbum from './AddAlbum';
import EditAlbum from './EditAlbum';

const AlbumManager = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const [view, setView] = useState('list');
    const [albums, setAlbums] = useState([]);
    const [editingAlbum, setEditingAlbum] = useState(null);

    // --- STATE TÌM KIẾM & PHÂN TRANG ---
    const [searchTerm, setSearchTerm] = useState('');
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

    // --- LOGIC TÌM KIẾM & PHÂN TRANG ---
    const safeAlbums = Array.isArray(albums) ? albums : [];
    const filteredAlbums = safeAlbums.filter(album => 
        // Đã sửa 'name' thành 'title' để tìm kiếm hoạt động chính xác
        (album?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAlbums = filteredAlbums.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className='p-4 sm:p-8 w-full'>
            {view === 'list' && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Danh sách Album</h2>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm album..." 
                            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ListAlbum 
                        albums={currentAlbums} 
                        fetchAlbums={fetchAlbums} 
                        setView={setView} 
                        setEditingAlbum={setEditingAlbum}
                        url={url}
                        startIndex={indexOfFirstItem}
                    />

                    {totalPages > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md bg-gray-100 disabled:opacity-50 hover:bg-gray-200"
                            >
                                Trước
                            </button>
                            <span className="font-medium text-gray-700">Trang {currentPage} / {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md bg-gray-100 disabled:opacity-50 hover:bg-gray-200"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}

            {view === 'add' && (
                <AddAlbum 
                    setView={setView} 
                    fetchAlbums={fetchAlbums} 
                    url={url}
                />
            )}

            {view === 'edit' && editingAlbum && (
                <EditAlbum 
                    key={editingAlbum._id} 
                    setView={setView} 
                    fetchAlbums={fetchAlbums} 
                    url={url}
                    albumData={editingAlbum}
                />
            )}
        </div>
    )
}

export default AlbumManager;