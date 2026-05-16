import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Layouts
import AdminLayout from "./layouts/AdminLayout.jsx";
import StudioLayout from "./layouts/StudioLayout.jsx";

// Auth
import Login from "./pages/auth/Login.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard.jsx";
import ModerationManager from "./pages/admin/moderation/ModerationManager.jsx";
import SongManager from "./pages/admin/catalog/songs/SongManager.jsx";
import ArtistManager from "./pages/admin/catalog/artists/ArtistManager.jsx";
import AlbumManager from "./pages/admin/catalog/albums/AlbumManager.jsx";
import CategoryManager from "./pages/admin/catalog/categories/CategoryManager.jsx";
import ArtistRequests from "./pages/admin/artist-requests/ArtistRequests.jsx";

// Artist (Studio) Pages
import ArtistDashboard from "./pages/artist/dashboard/ArtistDashboard.jsx";
import ContentManager from "./pages/artist/catalog/ContentManager.jsx";
import ArtistAlbumManager from "./pages/artist/albums/AlbumManager.jsx";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  // Lưu vào localStorage khi thay đổi
  useEffect(() => {
    token ? localStorage.setItem('token', token) : localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    role ? localStorage.setItem('role', role) : localStorage.removeItem('role');
  }, [role]);

  const handleLogout = () => {
    setToken('');
    setRole('');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* ==================== LOGIN ==================== */}
        <Route 
          path="/login" 
          element={
            token 
              ? <Navigate to={role === 'admin' ? "/admin" : "/studio"} replace /> 
              : <Login setToken={setToken} setRole={setRole} />
          } 
        />

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route 
          path="/admin/*" 
          element={token && role === 'admin' 
            ? <AdminLayout setToken={handleLogout} setRole={setRole} /> 
            : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="moderation" element={<ModerationManager />} />
          <Route path="catalog/songs" element={<SongManager />} />
          <Route path="catalog/artists" element={<ArtistManager />} />
          <Route path="catalog/albums" element={<AlbumManager />} />
          <Route path="catalog/categories" element={<CategoryManager />} />
          <Route path="artist-requests" element={<ArtistRequests />} />
        </Route>

        {/* ==================== STUDIO (ARTIST) ROUTES ==================== */}
        <Route 
          path="/studio/*" 
          element={token && role === 'artist' 
            ? <StudioLayout setToken={handleLogout} setRole={setRole} /> 
            : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ArtistDashboard />} />
          <Route path="tracks" element={<ContentManager />} />
          <Route path="albums" element={<ArtistAlbumManager />} />
        </Route>

        {/* ==================== DEFAULT & 404 ==================== */}
        <Route 
          path="/" 
          element={
            token 
              ? <Navigate to={role === 'admin' ? "/admin" : "/studio"} replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;