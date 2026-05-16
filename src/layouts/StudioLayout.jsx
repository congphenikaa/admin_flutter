import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const StudioLayout = ({ setToken, setRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken('');
    if (setRole) setRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="bg-[#131313] min-h-screen text-white font-sans selection:bg-[#53e076] selection:text-[#003914]">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 h-16 bg-[#1c1b1b]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-6">
        <div className="flex items-center gap-12">
          <span className="text-lg font-black tracking-tighter">Creator Studio</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#a1a1aa] hover:text-white p-2">notifications</button>
          <button className="material-symbols-outlined text-[#a1a1aa] hover:text-white p-2">help_outline</button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Logout
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-[#1c1b1b]/95 border-r border-white/5 pt-16 hidden md:flex flex-col">
        <div className="px-6 py-6">
          <h2 className="text-2xl font-black text-[#53e076]">Studio</h2>
          <p className="text-[#a1a1aa] text-xs uppercase tracking-widest mt-1">Verified Artist</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavLink to="/studio/dashboard" className={({isActive}) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive ? 'bg-[#53e076] text-[#003914]' : 'text-[#a1a1aa] hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>

          <NavLink to="/studio/tracks" className={({isActive}) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive ? 'bg-[#53e076] text-[#003914]' : 'text-[#a1a1aa] hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">library_music</span>
            Content
          </NavLink>

          <NavLink to="/studio/albums" className={({isActive}) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive ? 'bg-[#53e076] text-[#003914]' : 'text-[#a1a1aa] hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">album</span>
            Albums
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pl-0 md:pl-64 pt-16 pb-10 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default StudioLayout;