import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
import ListCategory from './ListCategory';
import AddCategory from './AddCategory';
import EditCategory from './EditCategory';

const CategoryManager = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const [view, setView] = useState('list');
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);

    // --- Shared global search & pagination ---
    const { globalSearch } = useOutletContext();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/category/list`);
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách");
        }
    }, [url]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // --- FILTER USING globalSearch ---
    const safeCategories = Array.isArray(categories) ? categories : [];
    const filteredCategories = safeCategories.filter(category => {
        const searchStr = globalSearch ? globalSearch.toLowerCase() : '';
        const targetName = category.name;
        return targetName.toLowerCase().includes(searchStr);
    });

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [globalSearch]);

    return (
        <div className="w-full relative">
            {/* Always visible: Header & List Wrapper */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#191b24]">Quản lý Thể loại</h1>
                    <p className="text-sm text-[#737687]">Định nghĩa cấu trúc thể loại âm nhạc.</p>
                </div>
                <button
                    onClick={() => setView('add')}
                    className="px-4 py-2 bg-[#0f62fe] text-white rounded-md text-sm font-semibold hover:bg-[#004ccd] transition-colors shadow-sm flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm Thể loại
                </button>
            </div>

            {/* Always visible: The List */}
            <div className="bg-white rounded-lg border border-[#e1e1ee] shadow-sm flex flex-col">
                <div className="p-0">
                    <ListCategory
                        categories={currentCategories}
                        fetchCategories={fetchCategories}
                        setView={setView}
                        setEditingCategory={setEditingCategory}
                        url={url}
                        startIndex={(currentPage - 1) * itemsPerPage}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-[#e1e1ee] flex justify-between items-center bg-[#faf8ff] rounded-b-lg">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition">Trước</button>
                        <span className="text-sm font-medium text-[#737687]">Trang <strong className="text-[#191b24]">{currentPage}</strong> / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-[#c3c6d8] rounded-md bg-white text-sm font-medium text-[#424656] disabled:opacity-50 hover:bg-[#f2f3ff] transition">Sau</button>
                    </div>
                )}
            </div>

            {/* The Overlay & Drawer (Only visible when view is 'add' or 'edit') */}
            {(view === 'add' || view === 'edit') && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
                    {/* Click backdrop to close */}
                    <div className="absolute inset-0" onClick={() => setView('list')}></div>

                    {/* The sliding panel container */}
                    <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-[slideInRight_0.3s_ease-out]">
                        {view === 'add' && <AddCategory setView={setView} fetchCategories={fetchCategories} url={url} />}
                        {view === 'edit' && editingCategory && <EditCategory key={editingCategory._id} setView={setView} fetchCategories={fetchCategories} url={url} categoryData={editingCategory} />}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CategoryManager;