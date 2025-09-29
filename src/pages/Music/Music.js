import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiPlay, FiPause } from 'react-icons/fi';
import { musicService } from '../../services/musicService';
import { categoryService } from '../../services/categoryService';
import './Music.css';

const Music = () => {
    const [music, setMusic] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [playingId, setPlayingId] = useState(null);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategories(true); // Pass true to get all categories

            if (response.result === 0) {
                setCategories(response.payload.category || []);
                console.log('Categories loaded:', response.payload.category?.length || 0);
            } else {
                console.error('Categories API returned error:', response.message);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            console.error('Categories error details:', error.response?.data || error.message);
            setCategories([]);
        }
    };

    const getCategoryName = useCallback((categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : 'Unknown';
    }, [categories]);

    const fetchMusic = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                ...(selectedCategory && { categoryId: selectedCategory })
            };

            const response = await musicService.getMusic(params);
            console.log('Music response:', response);

            if (response.result === 0) {
                // Map the API response to include categoryName from categories state
                const musicWithCategoryNames = response.payload.music.map(track => ({
                    ...track,
                    categoryName: getCategoryName(track.categoryId),
                    duration: track.duration.toString() // Ensure duration is string for consistency
                }));

                setMusic(musicWithCategoryNames);
                console.log('Music loaded:', musicWithCategoryNames.length, 'tracks');

                // Calculate total pages based on count and limit
                const totalCount = response.payload.count || 0;
                const calculatedPages = Math.ceil(totalCount / 10);
                setTotalPages(calculatedPages);
            } else {
                console.error('Music API returned error:', response.message);
                setMusic([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching music:', error);
            console.error('Music error details:', error.response?.data || error.message);
            setMusic([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedCategory, getCategoryName]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Fetch music regardless of categories loading status
        // If categories fail, we'll still show music with "Unknown" category names
        fetchMusic();
    }, [fetchMusic]);

    // Separate effect for when categories change (for filtering)
    useEffect(() => {
        if (currentPage > 1 || selectedCategory) {
            fetchMusic();
        }
    }, [currentPage, selectedCategory, fetchMusic]);

    const filteredMusic = music.filter(track =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.musicBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedMusic(null);
        setModalMode('add');
        setShowModal(true);
    };

    const handleEdit = (track) => {
        setSelectedMusic(track);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (musicId) => {
        if (window.confirm('Are you sure you want to delete this music track?')) {
            try {
                await musicService.deleteMusic(musicId);
                setMusic(music.filter(track => track._id !== musicId));
            } catch (error) {
                console.error('Error deleting music:', error);
                alert('Error deleting music track');
            }
        }
    };

    const handlePlay = (musicId) => {
        if (playingId === musicId) {
            setPlayingId(null);
        } else {
            setPlayingId(musicId);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <p>Loading music...</p>
            </div>
        );
    }

    return (
        <div className="music-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Music Management</h1>
                    <p>Manage your music library</p>
                </div>
                <button className="add-btn" onClick={handleAdd}>
                    <FiPlus />
                    Add Music
                </button>
            </div>

            <div className="music-controls">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search music by title or artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
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

            <div className="music-table-container">
                <table className="music-table">
                    <thead>
                        <tr>
                            <th>Track</th>
                            <th>Artist</th>
                            <th>Category</th>
                            <th>Duration</th>
                            <th>Premium</th>
                            <th>Added</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMusic.map((track) => (
                            <tr key={track._id}>
                                <td>
                                    <div className="track-info">
                                        <div className="track-image">
                                            {track.image ? (
                                                <img src={track.image} alt={track.title} />
                                            ) : (
                                                <div className="default-image">♪</div>
                                            )}
                                        </div>
                                        <div className="track-details">
                                            <span className="track-title">{track.title}</span>
                                            <button
                                                className="play-btn"
                                                onClick={() => handlePlay(track._id)}
                                            >
                                                {playingId === track._id ? <FiPause /> : <FiPlay />}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td>{track.musicBy}</td>
                                <td>
                                    <span className="category-badge">
                                        {track.categoryName}
                                    </span>
                                </td>
                                <td>{formatDuration(parseInt(track.duration))}</td>
                                <td>
                                    <span className={`premium-status ${track.isSubscribe ? 'premium' : 'free'}`}>
                                        {track.isSubscribe ? 'Premium' : 'Free'}
                                    </span>
                                </td>
                                <td>{formatDate(track.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn edit"
                                            onClick={() => handleEdit(track)}
                                            title="Edit Track"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDelete(track._id)}
                                            title="Delete Track"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredMusic.length === 0 && (
                    <div className="empty-state">
                        <p>No music tracks found</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>{currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {showModal && (
                <MusicModal
                    music={selectedMusic}
                    mode={modalMode}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchMusic();
                    }}
                />
            )}
        </div>
    );
};

const MusicModal = ({ music, mode, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: music?.title || '',
        musicBy: music?.musicBy || '',
        duration: music?.duration || '',
        categoryId: music?.categoryId || '',
        isSubscribe: music?.isSubscribe || false
    });
    const [imageFile, setImageFile] = useState(null);
    const [musicFile, setMusicFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (fileType === 'image') {
            setImageFile(file);
        } else if (fileType === 'music') {
            setMusicFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (musicFile) {
                submitData.append('file', musicFile);
            }

            if (mode === 'add') {
                await musicService.addMusic(submitData);
            } else {
                await musicService.updateMusic(music._id, submitData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving music:', error);
            alert('Error saving music track');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal music-modal">
                <div className="modal-header">
                    <h3>{mode === 'add' ? 'Add New Music' : 'Edit Music'}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="title">Track Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="musicBy">Artist</label>
                                <input
                                    type="text"
                                    id="musicBy"
                                    name="musicBy"
                                    value={formData.musicBy}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="duration">Duration (seconds)</label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

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
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Cover Image</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'image')}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="file">Music File</label>
                            <input
                                type="file"
                                id="file"
                                accept="audio/*"
                                onChange={(e) => handleFileChange(e, 'music')}
                            />
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isSubscribe"
                                    checked={formData.isSubscribe}
                                    onChange={handleChange}
                                />
                                Premium Content
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="save-btn" disabled={saving}>
                                {saving ? 'Saving...' : mode === 'add' ? 'Add Track' : 'Update Track'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Music;
