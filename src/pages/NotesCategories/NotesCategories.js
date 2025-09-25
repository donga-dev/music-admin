import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiTag } from 'react-icons/fi';
import { notesCategoryService } from '../../services/notesCategoryService';
import './NotesCategories.css';

const NotesCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ name: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await notesCategoryService.getNoteCategories();
            setCategories(response.payload.noteCategory || []);
        } catch (error) {
            console.error('Error fetching note categories:', error);
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
        if (window.confirm('Are you sure you want to delete this category? All notes in this category will be affected.')) {
            try {
                await notesCategoryService.deleteNoteCategory(categoryId);
                // Refresh the categories list to get the latest data from server
                await fetchCategories();
            } catch (error) {
                console.error('Error deleting note category:', error);
                alert('Error deleting category');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (modalMode === 'add') {
                await notesCategoryService.addNoteCategory(formData.name);
                // Refresh the categories list to get the latest data from server
                await fetchCategories();
            } else {
                await notesCategoryService.updateNoteCategory(selectedCategory._id, formData.name);
                setCategories(categories.map(cat =>
                    cat._id === selectedCategory._id
                        ? { ...cat, name: formData.name }
                        : cat
                ));
            }
            setShowModal(false);
            setFormData({ name: '' });
        } catch (error) {
            console.error('Error saving note category:', error);
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

    const getCategoryColor = (index) => {
        const colors = [
            { bg: '#f0f4ff', border: '#667eea', text: '#4c51bf' },
            { bg: '#f0fff4', border: '#48bb78', text: '#2f855a' },
            { bg: '#fffbf0', border: '#ed8936', text: '#c05621' },
            { bg: '#faf5ff', border: '#9f7aea', text: '#6b46c1' },
            { bg: '#fff5f5', border: '#f56565', text: '#c53030' },
            { bg: '#f0fdfa', border: '#38b2ac', text: '#2c7a7b' }
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading note categories...</p>
            </div>
        );
    }

    return (
        <div className="notes-categories-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Notes Categories</h1>
                    <p>Organize your notes with categories</p>
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
                {filteredCategories.map((category, index) => {
                    const colors = getCategoryColor(index);
                    return (
                        <div
                            key={category._id}
                            className="category-card"
                            style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border
                            }}
                        >
                            <div className="category-header">
                                <div
                                    className="category-icon"
                                    style={{
                                        backgroundColor: colors.border,
                                        color: 'white'
                                    }}
                                >
                                    <FiTag />
                                </div>
                                <div className="category-actions">
                                    <button
                                        className="action-btn edit"
                                        onClick={() => handleEdit(category)}
                                        title="Edit Category"
                                    >
                                        <FiEdit />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(category._id)}
                                        title="Delete Category"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <div className="category-content">
                                <h3 style={{ color: colors.text }}>{category.name}</h3>
                                <div className="category-stats">
                                    <span className="notes-count" style={{ color: colors.text }}>
                                        {category.notesCount} notes
                                    </span>
                                    <span className="created-date">
                                        Created: {formatDate(category.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredCategories.length === 0 && !loading && (
                <div className="empty-state">
                    <FiTag size={60} />
                    <p>No note categories found</p>
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
                            <h3>{modalMode === 'add' ? 'Add Note Category' : 'Edit Note Category'}</h3>
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

                                <div className="category-preview">
                                    <p>Preview:</p>
                                    <div className="preview-card">
                                        <FiTag />
                                        <span>{formData.name || 'Category Name'}</span>
                                    </div>
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

export default NotesCategories;
