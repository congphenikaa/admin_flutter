import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import AdminHeader from '../components/AdminHeader.jsx';

const AdminLayout = ({ setToken, setRole }) => {
  // Global search state to be shared across pages
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="flex h-screen bg-[#faf8ff] text-[#191b24] font-sans overflow-hidden">
      <Sidebar setToken={setToken} setRole={setRole} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Pass the setter to the Header */}
        <AdminHeader setGlobalSearch={setGlobalSearch} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
               {/* Pass the state to the child routes (e.g., SongManager) */}
               <Outlet context={{ globalSearch }} />
            </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
