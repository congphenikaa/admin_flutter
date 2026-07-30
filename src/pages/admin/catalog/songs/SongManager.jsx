import React, { useEffect, useState, useCallback } from 'react'
import api from '../../../../utils/api'
import { toast } from 'react-toastify'
import { useOutletContext } from 'react-router-dom'
import ListSong from './ListSong'
import AddSong from './AddSong'
import EditSong from './EditSong'

const SongManager = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { globalSearch } = useOutletContext();

    const [view, setView] = useState('list');
    const [songs, setSongs] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [editingId, setEditingId] = useState(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('All');
    const [genreFilter, setGenreFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch Songs
    const fetchSongs = useCallback(async () => {
        try {
            const response = await api.get(`/song/list`);
            if (response.data.success) {
                setSongs(response.data.songs);
            }
        } catch {
            toast.error("Lỗi tải dữ liệu bài hát");
        }
    }, [backendUrl]);

    // Fetch Categories (Mới)
    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get(`/category/list`);
            if (response.data.success) {
                setCategories(response.data.categories || []);
            }
        } catch {
            console.log("Không thể tải danh sách thể loại");
        }
    }, [backendUrl]);

    useEffect(() => {
        fetchSongs();
        fetchCategories(); // ← Gọi khi component mount
    }, [fetchSongs, fetchCategories]);

    // === FILTER LOGIC ===
    const filteredSongs = songs.filter(song => {
        // Global Search
        const searchMatch = globalSearch === '' ||
            song.title?.toLowerCase().includes(globalSearch.toLowerCase()) ||
            song.description?.toLowerCase().includes(globalSearch.toLowerCase());

        // Status Filter
        let statusMatch = true;
        if (statusFilter !== 'All') {
            if (statusFilter === 'Live') statusMatch = song.status === 'live';
        }

        // Genre Filter (so sánh theo _id)
        const genreMatch = genreFilter === 'All' || 
            song.category?.some(cat => {
                const catId = typeof cat === 'string' ? cat : cat._id;
                return catId === genreFilter;
            });

        return searchMatch && statusMatch && genreMatch;
    });

    const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
    const currentData = filteredSongs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full">
            {view === 'list' && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Song Management</h1>
                        <p className="text-sm text-[#737687]">Manage all tracks available on the platform.</p>
                    </div>

                    <button
                        onClick={() => setView('add')}
                        className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Upload New Track
                    </button>
                </div>
            )}

            {view === 'list' && (
                <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm flex flex-col">

                    {/* FILTER BAR */}
                    <div className="p-4 border-b border-[#e1e1ee] flex items-center gap-4 bg-[#f2f3ff]/30 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#737687] text-[18px]">filter_list</span>
                            <span className="text-sm font-semibold text-[#424656]">Filters:</span>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white border border-[#c3c6d8] text-[#191b24] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0f62fe]"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Published">Published</option>
                            <option value="Pending">Pending Review</option>
                            <option value="Flagged">Flagged by AI</option>
                        </select>

                        {/* Genre Filter - Động */}
                        <select
                            value={genreFilter}
                            onChange={(e) => {
                                setGenreFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white border border-[#c3c6d8] text-[#191b24] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0f62fe]"
                        >
                            <option value="All">All Genres</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

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
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff]">
                                Previous
                            </button>
                            <span className="text-sm font-medium text-[#737687]">
                                Page <strong className="text-[#191b24]">{currentPage}</strong> of {totalPages}
                            </span>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff]">
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {view === 'add' && <AddSong setView={setView} fetchSongs={fetchSongs} />}
            {view === 'edit' && <EditSong setView={setView} fetchSongs={fetchSongs} editingId={editingId} songs={songs} />}
        </div>
    );
};

export default SongManager;