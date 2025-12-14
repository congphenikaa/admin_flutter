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

    return (
        <div className='p-4 sm:p-8 w-full'>
            {/* 1. HIỂN THỊ DANH SÁCH */}
            {view === 'list' && (
                <ListSong 
                    songs={songs} 
                    fetchSongs={fetchSongs} 
                    setView={setView} 
                    setEditingId={setEditingId} 
                />
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