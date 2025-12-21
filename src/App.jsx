import React, { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import SongManager from "./pages/songs/SongManager.jsx"; 
import ArtistManager from "./pages/artists/ArtistManager.jsx";
import AlbumManager from "./pages/albums/AlbumManager.jsx";
import CategoryManager from "./pages/categories/CategoryManager.jsx";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <div className="flex items-start min-h-screen">
          <Sidebar setToken={setToken}/>
          
          <div className="flex-1 h-screen overflow-y-scroll bg-[#F3FFF7]">
            
            <div className="flex w-full"> 
                <Routes>
                    {/* Mặc định vào trang Songs luôn */}
                    <Route path='/' element={<Navigate to="/songs" />} />
                    
                    {/* Route duy nhất quản lý tất cả về bài hát */}
                    <Route path='/songs' element={<SongManager />} />
                    <Route path='/artists' element={<ArtistManager />} />
                    <Route path='/albums' element={<AlbumManager />} />
                    <Route path='/categories' element={<CategoryManager />} />
                </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;