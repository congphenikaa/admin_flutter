import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const StudioLayout = ({ setToken, setRole }) => {

  const handleLogout = () => {
    setToken('');
    if(setRole) setRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <div className="bg-[#131313] min-h-screen text-white font-sans selection:bg-[#53e076] selection:text-[#003914]">
      
      {/* 1. TOP HEADER (Fixed) */}
      <header className="fixed top-0 w-full z-50 h-16 bg-[#1c1b1b]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/40 flex justify-between items-center px-6 gap-8">
        <div className="flex items-center gap-12 flex-1">
          <span className="text-lg font-black tracking-tighter text-white">Creator Studio</span>
          
          {/* Global Search */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] group-focus-within:text-[#53e076] transition-colors">search</span>
            <input 
              className="w-full bg-[#0e0e0e] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#53e076] transition-all text-white placeholder:text-[#a1a1aa]" 
              placeholder="Search tracks, albums, analytics..." 
              type="text"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-all duration-300 p-2 rounded-full">notifications</button>
          <button className="material-symbols-outlined text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-all duration-300 p-2 rounded-full">help_outline</button>
          <button className="bg-[#1db954] text-[#003914] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#53e076] hover:scale-[0.97] transition-all shadow-[0_0_15px_rgba(29,185,84,0.2)]">
            Upload
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:border-[#53e076] transition-colors">
            <img alt="User profile" className="w-full h-full object-cover" src="[https://ui-avatars.com/api/?name=Artist&background=53e076&color=003914](https://ui-avatars.com/api/?name=Artist&background=53e076&color=003914)"/>
          </div>
        </div>
      </header>

      {/* 2. SIDEBAR (Fixed left, below header) */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 rounded-r-lg bg-[#1c1b1b]/95 backdrop-blur-md border-r border-white/5 flex flex-col gap-2 p-4 pt-20 hidden md:flex">
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-black text-[#53e076]">Studio</h2>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mt-1">Verified Artist</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavLink to="/studio/dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${isActive ? 'bg-[#53e076] text-[#003914] shadow-[0_0_15px_rgba(83,224,118,0.3)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
            Dashboard
          </NavLink>
          <NavLink to="/studio/tracks" className={({isActive}) => `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${isActive ? 'bg-[#53e076] text-[#003914] shadow-[0_0_15px_rgba(83,224,118,0.3)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>library_music</span>
            Content
          </NavLink>
          <NavLink to="/studio/albums" className={({isActive}) => `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${isActive ? 'bg-[#53e076] text-[#003914] shadow-[0_0_15px_rgba(83,224,118,0.3)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>album</span>
            Albums
          </NavLink>
          <NavLink to="/studio/analytics" className={({isActive}) => `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all ${isActive ? 'bg-[#53e076] text-[#003914] shadow-[0_0_15px_rgba(83,224,118,0.3)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>bar_chart</span>
            Analytics
          </NavLink>
        </nav>

        <div className="mt-auto px-2">
           <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full font-bold text-[#a1a1aa] rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <span className="material-symbols-outlined">logout</span> Log Out
           </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT (Padded to avoid overlapping fixed elements) */}
      <main className="pl-0 md:pl-64 pt-16 pb-28 min-h-screen">
         {/* This is where ArtistDashboard will be rendered */}
         <Outlet />
      </main>
    </div>
  );
};

export default StudioLayout;