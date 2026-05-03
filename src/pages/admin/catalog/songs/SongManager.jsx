import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useOutletContext } from 'react-router-dom'
import ListSong from './ListSong'
import AddSong from './AddSong'
import EditSong from './EditSong'

const SongManager = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // 1. Consume the global search term from AdminLayout
    const { globalSearch } = useOutletContext();
    
    const [view, setView] = useState('list');
    const [songs, setSongs] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Filter states (Replacing the old local search)
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Hàm load dữ liệu chung cho cả 3 component sử dụng
    const fetchSongs = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/song/list`);
            if (response.data.success) {
                setSongs(response.data.songs);
            }
        } catch {
            toast.error("Lỗi tải dữ liệu");
        }
    }, [backendUrl]);

    // Load lần đầu
    useEffect(() => {
        fetchSongs();
    }, [fetchSongs]);

    // --- APPLY FILTERS & GLOBAL SEARCH ---
    const filteredSongs = songs.filter(song => {
        // 1. Check Global Search (by name, artist, etc.)
        const searchMatch = globalSearch === '' ||
            song.title?.toLowerCase().includes(globalSearch.toLowerCase()) ||
            song.desc?.toLowerCase().includes(globalSearch.toLowerCase());

        // 2. Check Local Filter (Placeholder logic for future status implementation)
        const statusMatch = statusFilter === 'All' || song.status === statusFilter;

        return searchMatch && statusMatch;
    });

    const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
    const currentData = filteredSongs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full">
            {/* Page Header Area - only visible in list view */}
            {view === 'list' && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Song Management</h1>
                        <p className="text-sm text-[#737687]">Manage all tracks available on the platform.</p>
                    </div>

                    <button
                        onClick={() => setView('add')}
                        className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Upload New Track
                    </button>
                </div>
            )}

            {/* List View */}
            {view === 'list' && (
                <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm flex flex-col">

                    {/* Filter Bar (Replaced old local search) */}
                    <div className="p-4 border-b border-[#e1e1ee] flex items-center gap-4 bg-[#f2f3ff]/30">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#737687] text-[18px]">filter_list</span>
                            <span className="text-sm font-semibold text-[#424656]">Filters:</span>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-[#c3c6d8] text-[#191b24] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0f62fe] focus:border-[#0f62fe]"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Published">Published</option>
                            <option value="Pending">Pending Review</option>
                            <option value="Flagged">Flagged by AI</option>
                        </select>

                        <select className="bg-white border border-[#c3c6d8] text-[#191b24] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0f62fe] focus:border-[#0f62fe]">
                            <option value="All">All Genres</option>
                            {/* Fetch categories dynamically later */}
                        </select>
                    </div>

                    {/* Render Child Component */}
                    <div className="p-0">
                        <ListSong
                            songs={currentData}
                            fetchSongs={fetchSongs}
                            setView={setView}
                            setEditingId={setEditingId}
                        />
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-[#e1e1ee] flex justify-between items-center bg-[#faf8ff] rounded-b-lg">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition"
                            >
                                Previous
                            </button>
                            <span className="text-sm font-medium text-[#737687]">
                                Page <strong className="text-[#191b24]">{currentPage}</strong> of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add & Edit Views */}
            {view === 'add' && <AddSong setView={setView} fetchSongs={fetchSongs} />}
            {view === 'edit' && <EditSong setView={setView} fetchSongs={fetchSongs} editingId={editingId} songs={songs} />}
        </div>
    )

}

export default SongManager;