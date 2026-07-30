import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ setToken, setRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Quản lý trạng thái đóng/mở của các nhóm menu
    const [openMenus, setOpenMenus] = useState({
        catalog: false,
        users: false,
        sales: false
    });

    // Tự động mở menu nếu đang ở trong trang thuộc menu đó
    useEffect(() => {
        setOpenMenus({
            catalog: location.pathname.includes('/admin/catalog'),
            users: location.pathname.includes('/admin/users') || location.pathname.includes('/admin/moderation') || location.pathname.includes('/admin/artist-requests'),
            sales: location.pathname.includes('/admin/premium') || location.pathname.includes('/admin/ads'),
        });
    }, [location.pathname]);

    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const logout = () => {
        setToken('');
        if (setRole) setRole('');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    // Style cho các link đơn (như Dashboard)
    const singleLinkClass = ({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-sm font-medium
        ${isActive
            ? 'bg-[#f2f3ff] text-[#0f62fe] relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#0f62fe] before:rounded-r-sm'
            : 'text-[#424656] hover:bg-[#ecedfa] hover:text-[#191b24]'
        }
    `;

    // Style cho các link con bên trong dropdown
    const subLinkClass = ({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-sm transition-colors text-sm font-medium
        ${isActive ? 'bg-[#f2f3ff] text-[#0f62fe]' : 'text-[#737687] hover:bg-[#ecedfa] hover:text-[#191b24]'}
    `;

    return (
        <aside className="w-[260px] min-w-[260px] bg-white border-r border-[#e1e1ee] flex flex-col h-screen hidden lg:flex shrink-0">
            {/* Header */}
            <div className="h-[64px] border-b border-[#e1e1ee] flex items-center px-6 gap-3 shrink-0">
                <div className="w-8 h-8 bg-[#0f62fe] rounded-md flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-[#191b24]">CMS Admin</h1>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">

                {/* Dashboard */}
                <NavLink to='/admin/dashboard' className={singleLinkClass}>
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    Dashboard
                </NavLink>

                {/* 1. Catalog Dropdown */}
                <div>
                    <button
                        onClick={() => toggleMenu('catalog')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-colors text-sm font-medium ${openMenus.catalog ? 'text-[#0f62fe]' : 'text-[#424656] hover:bg-[#ecedfa] hover:text-[#191b24]'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">folder_open</span>
                            Catalog
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${openMenus.catalog ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {openMenus.catalog && (
                        <div className="mt-1 ml-4 pl-3 border-l border-[#c3c6d8] space-y-1">
                            <NavLink to='/admin/catalog/songs' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">music_note</span> Songs
                            </NavLink>
                            <NavLink to='/admin/catalog/artists' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">mic_external_on</span> Artists
                            </NavLink>
                            <NavLink to='/admin/catalog/albums' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">album</span> Albums
                            </NavLink>
                            <NavLink to='/admin/catalog/categories' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">category</span> Categories
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* 2. Users & Moderation Dropdown */}
                <div>
                    <button
                        onClick={() => toggleMenu('users')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-colors text-sm font-medium ${openMenus.users ? 'text-[#0f62fe]' : 'text-[#424656] hover:bg-[#ecedfa] hover:text-[#191b24]'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                            Users & Moderation
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${openMenus.users ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {openMenus.users && (
                        <div className="mt-1 ml-4 pl-3 border-l border-[#c3c6d8] space-y-1">
                            <NavLink to='/admin/moderation' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">shield</span> Moderation Queue
                            </NavLink>
                            <NavLink to='/admin/artist-requests' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">person_add</span> Artist Requests
                            </NavLink>
                            <NavLink to='/admin/users' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">people</span> Users Management
                            </NavLink>
                            <NavLink to='/admin/premium/users' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">workspace_premium</span> Premium Users
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* 3. Sales & Marketing Dropdown */}
                <div>
                    <button
                        onClick={() => toggleMenu('sales')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-colors text-sm font-medium ${openMenus.sales ? 'text-[#0f62fe]' : 'text-[#424656] hover:bg-[#ecedfa] hover:text-[#191b24]'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">storefront</span>
                            Sales & Marketing
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${openMenus.sales ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {openMenus.sales && (
                        <div className="mt-1 ml-4 pl-3 border-l border-[#c3c6d8] space-y-1">
                            <NavLink to='/admin/premium/plans' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">featured_play_list</span> Premium Plans
                            </NavLink>
                            <NavLink to='/admin/premium/coupons' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">confirmation_number</span> Discount Coupons
                            </NavLink>
                            <NavLink to='/admin/premium/transactions' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span> Transactions
                            </NavLink>
                            <NavLink to='/admin/ads' className={subLinkClass}>
                                <span className="material-symbols-outlined text-[18px]">campaign</span> Ad Manager
                            </NavLink>
                        </div>
                    )}
                </div>

            </div>

            {/* Logout */}
            <div className="p-4 border-t border-[#e1e1ee]">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;