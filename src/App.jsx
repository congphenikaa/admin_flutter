import React, { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/Login.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import StudioLayout from "./layouts/StudioLayout.jsx";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard.jsx";
import ModerationManager from "./pages/admin/moderation/ModerationManager.jsx";
import SongManager from "./pages/admin/catalog/songs/SongManager.jsx";
import ArtistManager from "./pages/admin/catalog/artists/ArtistManager.jsx";
import AlbumManager from "./pages/admin/catalog/albums/AlbumManager.jsx";
import CategoryManager from "./pages/admin/catalog/categories/CategoryManager.jsx";
import ArtistDashboard from "./pages/artist/dashboard/ArtistDashboard.jsx";
import ContentManager from "./pages/artist/catalog/ContentManager.jsx";
import ArtistAlbumManager from "./pages/artist/albums/AlbumManager.jsx";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  // Cập nhật Storage an toàn khi State thay đổi
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
  }, [role]);

  // Handle Logout nhanh
  const handleLogout = () => {
    setToken('');
    setRole('');
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {token === '' ? (
        // Truyền cả setRole vào Login
        <Login setToken={setToken} setRole={setRole} />
      ) : (
        <Routes>
          {/* Mặc định điều hướng dựa vào Role */}
          <Route path="/" element={<Navigate to={role === 'admin' ? '/admin' : '/studio'} />} />
          
          {/* KHU VỰC QUẢN TRỊ VIÊN (ADMIN CMS) */}
          <Route path="/admin" element={role === 'admin' ? <AdminLayout setToken={handleLogout} /> : <Navigate to="/studio" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="moderation" element={<ModerationManager />} />
            <Route path="catalog/songs" element={<SongManager />} />
            <Route path="catalog/artists" element={<ArtistManager />} />
            <Route path="catalog/albums" element={<AlbumManager />} />
            <Route path="catalog/categories" element={<CategoryManager />} />
          </Route>

          {/* KHU VỰC NGHỆ SĨ (CREATOR STUDIO) */}
          <Route path="/studio" element={role === 'artist' ? <StudioLayout setToken={handleLogout} setRole={setRole} /> : <Navigate to="/admin" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<ArtistDashboard />} />
            <Route path="tracks" element={<ContentManager />} />
            <Route path="albums" element={<ArtistAlbumManager />} />
          </Route>

          {/* Artist alias route for plan compatibility */}
          <Route path="/artist" element={role === 'artist' ? <StudioLayout setToken={handleLogout} setRole={setRole} /> : <Navigate to="/admin" />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<ArtistDashboard />} />
            <Route path="tracks" element={<ContentManager />} />
            <Route path="albums" element={<ArtistAlbumManager />} />
          </Route>
        </Routes>
      )}
    </div>
  )
}

export default App;