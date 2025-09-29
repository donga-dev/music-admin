import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { categoryService } from '../../services/categoryService';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({ name: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getCategories(true);

            setCategories(response.payload.category);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedCategory(null);
        setFormData({ name: '' });
        setModalMode('add');
        setShowModal(true);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setFormData({ name: category.name });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryService.deleteCategory(categoryId);
                setCategories(categories.filter(cat => cat._id !== categoryId));
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Error deleting category');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (modalMode === 'add') {
                const response = await categoryService.addCategory(formData.name);
                // Add to local state
                const newCategory = {
                    _id: Date.now().toString(),
                    name: formData.name,
                    createdAt: new Date().toISOString(),
                    musicCount: 0
                };
                setCategories([...categories, newCategory]);
            } else {
                await categoryService.updateCategory(selectedCategory._id, formData.name);
                // Update local state
                setCategories(categories.map(cat =>
                    cat._id === selectedCategory._id
                        ? { ...cat, name: formData.name }
                        : cat
                ));
            }
            setShowModal(false);
            setFormData({ name: '' });
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error saving category');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="categories-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Music Categories</h1>
                    <p>Manage music categories for better organization</p>
                </div>
                <button className="add-btn" onClick={handleAdd}>
                    <FiPlus />
                    Add Category
                </button>
            </div>

            <div className="categories-controls">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="categories-grid">
                {filteredCategories.map((category) => (
                    <div key={category._id} className="category-card">
                        <div className="category-content">
                            <h3>{category.name}</h3>
                            <p className="music-count">{category.musicCount} tracks</p>
                            <p className="created-date">Created: {formatDate(category.createdAt)}</p>
                        </div>
                        <div className="category-actions">
                            <button
                                className="action-btn edit"
                                onClick={() => handleEdit(category)}
                                title="Edit Category"
                            >
                                ✏️
                            </button>
                            <button
                                className="action-btn delete"
                                onClick={() => handleDelete(category._id)}
                                title="Delete Category"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No categories found</p>
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Create First Category
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add New Category' : 'Edit Category'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Category Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ name: e.target.value })}
                                        placeholder="Enter category name"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={saving || !formData.name.trim()}
                                    >
                                        {saving ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
