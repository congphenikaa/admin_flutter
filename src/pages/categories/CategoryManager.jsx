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

    return (
        <div className='p-4 sm:p-8 w-full'>
            {view === 'list' && (
                <ListCategory 
                    categories={categories} 
                    fetchCategories={fetchCategories} 
                    setView={setView} 
                    setEditingCategory={setEditingCategory}
                    url={url}
                />
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