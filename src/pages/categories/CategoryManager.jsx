import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ListCategory from './ListCategory';
import AddCategory from './AddCategory';
import EditCategory from './EditCategory';

const CategoryManager = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const [view, setView] = useState('list');
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);

    // --- STATE TÌM KIẾM & PHÂN TRANG ---
    const [searchTerm, setSearchTerm] = useState('');
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

    // --- LOGIC TÌM KIẾM & PHÂN TRANG ---
    const safeCategories = Array.isArray(categories) ? categories : [];
    const filteredCategories = safeCategories.filter(cat => 
        (cat?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className='p-4 sm:p-8 w-full'>
            {view === 'list' && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Danh sách Thể loại</h2>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm thể loại..." 
                            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ListCategory 
                        categories={currentCategories} 
                        fetchCategories={fetchCategories} 
                        setView={setView} 
                        setEditingCategory={setEditingCategory}
                        url={url}
                        startIndex={indexOfFirstItem}
                    />

                    {totalPages > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md bg-gray-100 disabled:opacity-50 hover:bg-gray-200"
                            >
                                Trước
                            </button>
                            <span className="font-medium text-gray-700">Trang {currentPage} / {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md bg-gray-100 disabled:opacity-50 hover:bg-gray-200"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}

            {view === 'add' && (
                <AddCategory 
                    setView={setView} 
                    fetchCategories={fetchCategories} 
                    url={url}
                />
            )}

            {view === 'edit' && editingCategory && (
                <EditCategory 
                    key={editingCategory._id}
                    setView={setView} 
                    fetchCategories={fetchCategories} 
                    url={url}
                    categoryData={editingCategory}
                />
            )}
        </div>
    )
}

export default CategoryManager;