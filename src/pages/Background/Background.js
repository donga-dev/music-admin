import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiUpload } from 'react-icons/fi';
import { backgroundService } from '../../services/backgroundService';
import './Background.css';

const Background = () => {
    const [backgrounds, setBackgrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBackground, setSelectedBackground] = useState(null);
    const [modalMode, setModalMode] = useState('add');

    useEffect(() => {
        fetchBackgrounds();
    }, []);

    const fetchBackgrounds = async () => {
        try {
            setLoading(true);
            const response = await backgroundService.getBackground();
            console.log('Background API Response:', response.payload.background);

            setBackgrounds(response.payload.background || []);
        } catch (error) {
            console.error('Error fetching backgrounds:', error);
            console.error('Error details:', error.response?.data || error.message);
            alert('Failed to load backgrounds. Please try again.');
            setBackgrounds([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredBackgrounds = backgrounds
    const handleAdd = () => {
        setSelectedBackground(null);
        setModalMode('add');
        setShowModal(true);
    };

    const handleView = (background) => {
        setSelectedBackground(background);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (background) => {
        setSelectedBackground(background);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (backgroundId) => {
        if (window.confirm('Are you sure you want to delete this background?')) {
            try {
                await backgroundService.deleteBackground(backgroundId);
                setBackgrounds(backgrounds.filter(bg => bg._id !== backgroundId));
                alert('Background deleted successfully!');
            } catch (error) {
                console.error('Error deleting background:', error);
                alert('Error deleting background');
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading backgrounds...</p>
            </div>
        );
    }

    return (
        <div className="background-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Background Management</h1>
                    <p>Manage background images for the application</p>
                </div>
                <div className="header-actions">
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Add Background
                    </button>
                </div>
            </div>

            <div className="background-controls">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search backgrounds by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="backgrounds-grid">
                {filteredBackgrounds.map((background) => (
                    <div key={background._id} className="background-card">
                        <div className="background-image">
                            <img
                                src={background.image}
                                alt={background.title || 'Background'}
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.png';
                                }}
                            />
                            <div className="background-overlay">
                                <button
                                    className="action-btn view"
                                    onClick={() => handleView(background)}
                                    title="View Background"
                                >
                                    👁
                                </button>
                                <button
                                    className="action-btn edit"
                                    onClick={() => handleEdit(background)}
                                    title="Edit Background"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(background._id)}
                                    title="Delete Background"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <div className="background-info">
                            <h3>{background.title || 'Untitled'}</h3>
                            <p className="background-date">
                                {formatDate(background.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBackgrounds.length === 0 && !loading && (
                <div className="empty-state">
                    <FiUpload size={60} />
                    <p>No backgrounds found</p>
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Upload First Background
                    </button>
                </div>
            )}

            {showModal && (
                <BackgroundModal
                    background={selectedBackground}
                    mode={modalMode}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchBackgrounds();
                    }}
                />
            )}
        </div>
    );
};

const BackgroundModal = ({ background, mode, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: background?.title || '',
        image: null
    });
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(background?.image || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
                const submitData = new FormData();
                if (formData.title) submitData.append('title', formData.title);
                if (formData.image) submitData.append('image', formData.image);

                await backgroundService.addBackground(submitData);
                alert('Background added successfully!');
            } else if (mode === 'edit') {
                const submitData = new FormData();
                if (formData.title) submitData.append('title', formData.title);
                if (formData.image) submitData.append('image', formData.image);

                await backgroundService.updateBackground(background._id, submitData);
                alert('Background updated successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving background:', error);
            alert('Error saving background');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal background-modal">
                <div className="modal-header">
                    <h3>
                        {mode === 'view' ? 'View Background' :
                            mode === 'edit' ? 'Edit Background' : 'Add New Background'}
                    </h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {mode === 'view' ? (
                        <div className="background-view">
                            <div className="view-image">
                                <img src={background.image} alt={background.title} />
                            </div>
                            <div className="view-info">
                                <h2>{background.title || 'Untitled'}</h2>
                                <p><strong>Created:</strong> {new Date(background.createdAt).toLocaleString()}</p>
                                {background.updatedAt && (
                                    <p><strong>Updated:</strong> {new Date(background.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title (Optional)</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter background title"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">Background Image *</label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required={mode === 'add'}
                                />
                                {preview && (
                                    <div className="image-preview">
                                        <img src={preview} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : mode === 'add' ? 'Add Background' : 'Update Background'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Background;
