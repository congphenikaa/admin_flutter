import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ setToken, setRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isCatalogOpen, setIsCatalogOpen] = useState(true);

    const logout = () => {
        setToken('');
        if (setRole) setRole('');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const isCatalogActive = location.pathname.includes('/admin/catalog');

    return (
        <aside className="w-[260px] min-w-[260px] bg-white border-r border-[#e1e1ee] flex flex-col h-screen hidden lg:flex shrink-0">
            <div className="h-[64px] border-b border-[#e1e1ee] flex items-center px-6 gap-3 shrink-0">
                <div className="w-8 h-8 bg-[#0f62fe] rounded-md flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-[#191b24]">CMS Admin</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">

                {/* Dashboard */}
                <NavLink 
                    to='/admin/dashboard' 
                    className={({isActive}) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-sm font-medium
                        ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe] relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#0f62fe] before:rounded-r-sm' : 'text-[#424656] hover:bg-[#ecedfa] hover:text-[#191b24]'}
                    `}
                >
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    Dashboard
                </NavLink>

                {/* Moderation */}
                <NavLink 
                    to='/admin/moderation' 
                    className={({isActive}) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-sm font-medium
                        ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe] relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#0f62fe] before:rounded-r-sm' : 'text-[#424656] hover:bg-[#ecedfa] hover:text-[#191b24]'}
                    `}
                >
                    <span className="material-symbols-outlined text-[20px]">shield</span>
                    Moderation Queue
                </NavLink>

                <NavLink 
                    to='/admin/artist-requests' 
                    className={({isActive}) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-sm font-medium
                        ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe] relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#0f62fe] before:rounded-r-sm' : 'text-[#424656] hover:bg-[#ecedfa] hover:text-[#191b24]'}
                    `}
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Artist Requests
                </NavLink>

                {/* Catalog (Dropdown) */}
                <div>
                    <button 
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        className={`
                            w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-colors text-sm font-medium
                            ${isCatalogActive && !isCatalogOpen ? 'text-[#0f62fe]' : 'text-[#424656]'}
                            hover:bg-[#ecedfa] hover:text-[#191b24]
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">folder_open</span>
                            Catalog
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isCatalogOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {isCatalogOpen && (
                        <div className="mt-1 ml-4 pl-3 border-l border-[#c3c6d8] space-y-1">
                            <NavLink to='/admin/catalog/songs' className={({isActive}) => `
                                flex items-center gap-3 px-3 py-2 rounded-sm transition-colors text-sm font-medium
                                ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe]' : 'text-[#737687] hover:bg-[#ecedfa] hover:text-[#191b24]'}
                            `}>
                                <span className="material-symbols-outlined text-[18px]">music_note</span>
                                Songs
                            </NavLink>

                            <NavLink to='/admin/catalog/artists' className={({isActive}) => `
                                flex items-center gap-3 px-3 py-2 rounded-sm transition-colors text-sm font-medium
                                ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe]' : 'text-[#737687] hover:bg-[#ecedfa] hover:text-[#191b24]'}
                            `}>
                                <span className="material-symbols-outlined text-[18px]">mic_external_on</span>
                                Artists
                            </NavLink>

                            <NavLink to='/admin/catalog/albums' className={({isActive}) => `
                                flex items-center gap-3 px-3 py-2 rounded-sm transition-colors text-sm font-medium
                                ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe]' : 'text-[#737687] hover:bg-[#ecedfa] hover:text-[#191b24]'}
                            `}>
                                <span className="material-symbols-outlined text-[18px]">album</span>
                                Albums
                            </NavLink>

                            <NavLink to='/admin/catalog/categories' className={({isActive}) => `
                                flex items-center gap-3 px-3 py-2 rounded-sm transition-colors text-sm font-medium
                                ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe]' : 'text-[#737687] hover:bg-[#ecedfa] hover:text-[#191b24]'}
                            `}>
                                <span className="material-symbols-outlined text-[18px]">category</span>
                                Categories
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-[#e1e1ee]">
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6]"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;