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

    return (
        <div className='p-4 sm:p-8 w-full'>
            {view === 'list' && (
                <ListAlbum 
                    albums={albums} 
                    fetchAlbums={fetchAlbums} 
                    setView={setView} 
                    setEditingAlbum={setEditingAlbum}
                    url={url}
                />
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