import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import ListSong from './ListSong'
import AddSong from './AddSong'
import EditSong from './EditSong'

const SongManager = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // State quản lý View: 'list' | 'add' | 'edit'
    const [view, setView] = useState('list');
    const [songs, setSongs] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // --- STATE TÌM KIẾM & PHÂN TRANG ---
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số lượng bài hát trên 1 trang

    // Hàm load dữ liệu chung cho cả 3 component sử dụng
    const fetchSongs = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/song/list`);
            if (response.data.success) {
                setSongs(response.data.songs);
            }
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
        }
    }

    // Load lần đầu
    useEffect(() => {
        fetchSongs();
    }, []);

    // --- LOGIC TÌM KIẾM ---
    const safeSongs = Array.isArray(songs) ? songs : [];
    const filteredSongs = safeSongs.filter(song => 
        (song?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    // --- LOGIC PHÂN TRANG ---
    const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSongs = filteredSongs.slice(indexOfFirstItem, indexOfLastItem);

    // Reset về trang 1 khi người dùng gõ tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className='p-4 sm:p-8 w-full'>
            {/* 1. HIỂN THỊ DANH SÁCH */}
            {view === 'list' && (
                <div className="flex flex-col gap-4">
                    {/* Header: Tiêu đề + Tìm kiếm */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Danh sách Bài hát</h2>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm bài hát..." 
                            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ListSong 
                        songs={currentSongs} // Chỉ truyền data của trang hiện tại
                        fetchSongs={fetchSongs} 
                        setView={setView} 
                        setEditingId={setEditingId}
                        startIndex={indexOfFirstItem} // Truyền index để ListSong đánh STT 
                    />

                    {/* Điều hướng phân trang */}
                    {totalPages > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"
                            >
                                Trước
                            </button>
                            <span className="font-medium text-gray-700">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 2. HIỂN THỊ FORM THÊM */}
            {view === 'add' && (
                <AddSong 
                    setView={setView} 
                    fetchSongs={fetchSongs} 
                />
            )}

            {/* 3. HIỂN THỊ FORM SỬA */}
            {view === 'edit' && (
                <EditSong 
                    setView={setView} 
                    fetchSongs={fetchSongs} 
                    editingId={editingId} 
                    songs={songs}
                />
            )}
        </div>
    )
}

export default SongManager