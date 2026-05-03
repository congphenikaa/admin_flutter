import React from 'react';

const AdminHeader = ({ setGlobalSearch }) => {
    return (
        <header className="sticky top-0 z-20 bg-white border-b border-[#e1e1ee] px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737687] text-[20px]">
                        search
                    </span>
                    <input 
                        type="text" 
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        placeholder="Search tracks, users, or artists..." 
                        className="w-full pl-10 pr-4 py-2 bg-[#f2f3ff] border-none rounded-md text-sm focus:ring-2 focus:ring-[#0f62fe] focus:bg-white transition-all text-[#191b24] placeholder:text-[#737687]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-4">
                <button className="relative p-2 text-[#424656] hover:bg-[#ecedfa] rounded-md transition-colors">
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full border border-white"></span>
                </button>
                <div className="h-6 w-px bg-[#e1e1ee] mx-1"></div>
                <button className="flex items-center gap-2 p-1 pr-2 hover:bg-[#ecedfa] rounded-md transition-colors">
                    <div className="w-8 h-8 rounded-md bg-[#004ccd] flex items-center justify-center text-white font-bold text-sm">
                        AD
                    </div>
                    <div className="hidden sm:block text-left">
                        <div className="text-xs font-semibold text-[#191b24]">Admin User</div>
                        <div className="text-[10px] text-[#737687]">Super Admin</div>
                    </div>
                    <span className="material-symbols-outlined text-[#737687] text-[18px]">expand_more</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;