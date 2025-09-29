import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye, FiBook } from 'react-icons/fi';
import { verseService } from '../../services/verseService';
import './Verse.css';

const Verse = () => {
    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState(null);
    const [modalMode, setModalMode] = useState('add');

    useEffect(() => {
        fetchVerses();
    }, []);

    const fetchVerses = async () => {
        try {
            setLoading(true);
            const response = await verseService.getVerse(true);
            console.log('Verse API Response:', response.payload.verse);

            // Handle different possible response structures


            setVerses(response.payload.verse);
        } catch (error) {
            console.error('Error fetching verses:', error);
            alert('Failed to load verses. Please try again.');
            setVerses([]);
        } finally {
            setLoading(false);
        }
    };



    const handleAdd = () => {
        setSelectedVerse(null);
        setModalMode('add');
        setShowModal(true);
    };

    const handleView = (verse) => {
        setSelectedVerse(verse);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (verse) => {
        setSelectedVerse(verse);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (verseId) => {
        if (window.confirm('Are you sure you want to delete this verse?')) {
            try {
                await verseService.deleteVerse(verseId);
                setVerses(verses.filter(verse => verse._id !== verseId));
                alert('Verse deleted successfully!');
            } catch (error) {
                console.error('Error deleting verse:', error);
                alert('Error deleting verse');
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

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading verses...</p>
            </div>
        );
    }

    return (
        <div className="verse-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Verse Management</h1>
                    <p>Manage inspirational verses and quotes</p>
                </div>
                <div className="header-actions">
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Add Verse
                    </button>
                </div>
            </div>

            <div className="verse-controls">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search verses by content or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="verses-grid">
                {/* {filteredVerses.map((verse) => ( */}
                <div key={verses._id} className="verse-card">
                    <div className="verse-content">
                        <div className="verse-icon">
                            <FiBook />
                        </div>
                        <div className="verse-text">
                            <p className="verse-quote">
                                "{truncateText(verses.verse, 120)}"
                            </p>
                            <p className="verse-author">
                                — {verses.author || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    <div className="verse-actions">
                        <button
                            className="action-btn view"
                            onClick={() => handleView(verses)}
                            title="View Verse"
                        >
                            👁
                        </button>
                        <button
                            className="action-btn edit"
                            onClick={() => handleEdit(verses)}
                            title="Edit Verse"
                        >
                            ✏️
                        </button>
                        <button
                            className="action-btn delete"
                            onClick={() => handleDelete(verses._id)}
                            title="Delete Verse"
                        >
                            🗑️
                        </button>
                    </div>

                    <div className="verse-footer">
                        <span className="verse-date">
                            {formatDate(verses.createdAt)}
                        </span>
                    </div>
                </div>
                {/* ))} */}
            </div>

            {/* {filteredVerses.length === 0 && !loading && (
                <div className="empty-state">
                    <FiBook size={60} />
                    <p>No verses found</p>
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Add First Verse
                    </button>
                </div>
            )} */}

            {showModal && (
                <VerseModal
                    verse={selectedVerse}
                    mode={modalMode}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchVerses();
                    }}
                />
            )}
        </div>
    );
};

const VerseModal = ({ verse, mode, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        verse: verse?.verse || '',
        author: verse?.author || ''
    });
    const [saving, setSaving] = useState(false);

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
                await verseService.addVerse(formData);
                alert('Verse added successfully!');
            } else if (mode === 'edit') {
                await verseService.updateVerse(verse._id, formData);
                alert('Verse updated successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving verse:', error);
            alert('Error saving verse');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal verse-modal">
                <div className="modal-header">
                    <h3>
                        {mode === 'view' ? 'View Verse' :
                            mode === 'edit' ? 'Edit Verse' : 'Add New Verse'}
                    </h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {mode === 'view' ? (
                        <div className="verse-view">
                            <div className="view-verse-content">
                                <div className="verse-quote-large">
                                    <FiBook className="quote-icon" />
                                    <p>"{verse.verse}"</p>
                                </div>
                                <div className="verse-author-large">
                                    <p>— {verse.author || 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="view-info">
                                <p><strong>Created:</strong> {new Date(verse.createdAt).toLocaleString()}</p>
                                {verse.updatedAt && (
                                    <p><strong>Updated:</strong> {new Date(verse.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="verse">Verse Content *</label>
                                <textarea
                                    id="verse"
                                    name="verse"
                                    value={formData.verse}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    placeholder="Enter the verse or quote content..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="author">Author</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Enter author name (optional)"
                                />
                            </div>

                            <div className="verse-preview">
                                <label>Preview:</label>
                                <div className="preview-content">
                                    <div className="preview-quote">
                                        <FiBook className="preview-icon" />
                                        <p>"{formData.verse || 'Your verse will appear here...'}"</p>
                                    </div>
                                    <div className="preview-author">
                                        <p>— {formData.author || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : mode === 'add' ? 'Add Verse' : 'Update Verse'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Verse;
