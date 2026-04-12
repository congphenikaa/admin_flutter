import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ListArtist from './ListArtist';
import AddArtist from './AddArtist';
import EditArtist from './EditArtist';

const ArtistManager = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    
    const [view, setView] = useState('list');
    const [editingArtist, setEditingArtist] = useState(null); 
    const [artists, setArtists] = useState([]);
    
    // --- STATE TÌM KIẾM & PHÂN TRANG ---
    const [searchTerm, setSearchTerm] = useState('');
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

    // --- LOGIC TÌM KIẾM & PHÂN TRANG ---
    const safeArtists = Array.isArray(artists) ? artists : [];
    const filteredArtists = safeArtists.filter(artist => 
        (artist?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentArtists = filteredArtists.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className='p-4 sm:p-8 w-full'>
            {view === 'list' && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Danh sách Nghệ sĩ</h2>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm nghệ sĩ..." 
                            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ListArtist 
                        artists={currentArtists} 
                        fetchArtists={fetchArtists} 
                        setView={setView} 
                        setEditingArtist={setEditingArtist}
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
                <AddArtist 
                    setView={setView} 
                    fetchArtists={fetchArtists} 
                    url={url}
                />
            )}

            {view === 'edit' && editingArtist && (
                <EditArtist 
                    setView={setView} 
                    fetchArtists={fetchArtists} 
                    url={url}
                    artistData={editingArtist} 
                />
            )}
        </div>
    )
}

export default ArtistManager;