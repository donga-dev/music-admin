import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye, FiFilter } from 'react-icons/fi';
import { notesService } from '../../services/notesService';
import { notesCategoryService } from '../../services/notesCategoryService';
import './Notes.css';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notesService.getNotes(selectedCategory || null);

            // Map the API response to include categoryName from categories
            const notesWithCategoryName = response.notes?.map(note => {
                const category = categories.find(cat => cat._id === note.categoryId);
                return {
                    ...note,
                    categoryName: category?.name || 'Unknown'
                };
            }) || [];

            setNotes(notesWithCategoryName);
        } catch (error) {
            console.error('Error fetching notes:', error);
            // Show user-friendly error message
            alert('Failed to load notes. Please try again.');
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, categories]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            fetchNotes();
        }
    }, [categories, fetchNotes]);

    const fetchCategories = async () => {
        try {
            const response = await notesCategoryService.getNoteCategories(true);
            setCategories(response.noteCategories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Show user-friendly error message
            alert('Failed to load note categories. Please try again.');
            setCategories([]);
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedNote(null);
        setModalMode('add');
        setShowModal(true);
    };

    const handleView = (note) => {
        setSelectedNote(note);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (note) => {
        setSelectedNote(note);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await notesService.deleteNotes(noteId);
                setNotes(notes.filter(note => note._id !== noteId));
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Error deleting note');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const getCategoryColor = (categoryName) => {
        // Generate consistent colors based on category name hash
        const hashCode = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        };

        const predefinedColors = {
            'Personal': { bg: '#f0f4ff', text: '#4c51bf' },
            'Work': { bg: '#f0fff4', text: '#2f855a' },
            'Ideas': { bg: '#fffbf0', text: '#c05621' },
            'Inspiration': { bg: '#faf5ff', text: '#6b46c1' },
            'Goals': { bg: '#fff5f5', text: '#c53030' },
            'Memories': { bg: '#f0fdfa', text: '#2c7a7b' }
        };

        if (predefinedColors[categoryName]) {
            return predefinedColors[categoryName];
        }

        // Generate color for dynamic categories
        const colorPalette = [
            { bg: '#fef7f0', text: '#c05621' },
            { bg: '#f0f9ff', text: '#0369a1' },
            { bg: '#f0fdf4', text: '#15803d' },
            { bg: '#fdf2f8', text: '#be185d' },
            { bg: '#f3f4f6', text: '#374151' },
            { bg: '#fefce8', text: '#a16207' }
        ];

        const hash = Math.abs(hashCode(categoryName || ''));
        const colorIndex = hash % colorPalette.length;
        return colorPalette[colorIndex];
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading notes...</p>
            </div>
        );
    }

    return (
        <div className="notes-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Notes Management</h1>
                    <p>Create and manage your personal notes</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            ⊞
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            ☰
                        </button>
                    </div>
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Add Note
                    </button>
                </div>
            </div>

            <div className="notes-controls">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search notes by title or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <FiFilter className="filter-icon" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={`notes-container ${viewMode}`}>
                {filteredNotes.map((note) => {
                    const colors = getCategoryColor(note.categoryName);
                    return (
                        <div key={note._id} className="note-card">
                            <div className="note-header">
                                <div className="note-meta">
                                    <span className="note-mood">{note.mood}</span>
                                    <span
                                        className="note-category"
                                        style={{ backgroundColor: colors.bg, color: colors.text }}
                                    >
                                        {note.categoryName}
                                    </span>
                                </div>
                                <div className="note-actions">
                                    <button
                                        className="action-btn view"
                                        onClick={() => handleView(note)}
                                        title="View Note"
                                    >
                                        <FiEye />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => handleEdit(note)}
                                        title="Edit Note"
                                    >
                                        <FiEdit />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(note._id)}
                                        title="Delete Note"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <div className="note-content">
                                <h3>{note.title}</h3>
                                <div className="note-preview">
                                    {stripHtml(note.notes).substring(0, 150)}
                                    {stripHtml(note.notes).length > 150 && '...'}
                                </div>
                            </div>

                            <div className="note-footer">
                                <span className="note-date">
                                    {formatDate(note.updatedAt)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredNotes.length === 0 && !loading && (
                <div className="empty-state">
                    <FiEdit size={60} />
                    <p>No notes found</p>
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Create First Note
                    </button>
                </div>
            )}

            {showModal && (
                <NotesModal
                    note={selectedNote}
                    mode={modalMode}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchNotes();
                    }}
                />
            )}
        </div>
    );
};

const NotesModal = ({ note, mode, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: note?.title || '',
        notes: note?.notes || '',
        categoryId: note?.categoryId || '',
        mood: note?.mood || '📝'
    });
    const [saving, setSaving] = useState(false);

    const moodOptions = ['😊', '😢', '😡', '😍', '🤔', '💡', '📝', '🎵', '🏔️', '🌟', '❤️', '🚀'];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (mode === 'add') {
                await notesService.addNotes(formData);
            } else if (mode === 'edit') {
                await notesService.updateNotes(note._id, formData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal notes-modal">
                <div className="modal-header">
                    <h3>
                        {mode === 'view' ? 'View Note' :
                            mode === 'edit' ? 'Edit Note' : 'Add New Note'}
                    </h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {mode === 'view' ? (
                        <div className="note-view">
                            <div className="view-header">
                                <h2>{note.title}</h2>
                                <div className="view-meta">
                                    <span className="view-mood">{note.mood}</span>
                                    <span className="view-category">{note.categoryName}</span>
                                </div>
                            </div>
                            <div
                                className="view-content"
                                dangerouslySetInnerHTML={{ __html: note.notes }}
                            />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter note title"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="categoryId">Category</label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="mood">Mood</label>
                                    <div className="mood-selector">
                                        {moodOptions.map(moodOption => (
                                            <button
                                                key={moodOption}
                                                type="button"
                                                className={`mood-btn ${formData.mood === moodOption ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, mood: moodOption })}
                                            >
                                                {moodOption}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Content</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    required
                                    rows="10"
                                    placeholder="Write your note content here... (HTML supported)"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : mode === 'add' ? 'Create Note' : 'Update Note'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notes;
