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

    // Load lần đầu
    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    return (
        <div className='p-4 sm:p-8 w-full'>
            {/* 1. HIỂN THỊ DANH SÁCH */}
            {view === 'list' && (
                <ListArtist 
                    artists={artists} 
                    fetchArtists={fetchArtists} 
                    setView={setView} 
                    setEditingArtist={setEditingArtist}
                    url={url}
                />
            )}

            {/* 2. HIỂN THỊ FORM THÊM */}
            {view === 'add' && (
                <AddArtist 
                    setView={setView} 
                    fetchArtists={fetchArtists} 
                    url={url}
                />
            )}

            {/* 3. HIỂN THỊ FORM SỬA */}
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