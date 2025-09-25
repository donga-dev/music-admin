import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import { colorService } from '../../services/colorService';
import './Color.css';

const Color = () => {
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [modalMode, setModalMode] = useState('add');

    useEffect(() => {
        fetchColors();
    }, []);

    const fetchColors = async () => {
        try {
            setLoading(true);
            const response = await colorService.getColor(true);
            console.log('Color API Response:', response);

            // Handle different possible response structures
            let colorData = [];
            if (response.payload && response.payload.color) {
                colorData = response.payload.color;
            } else if (response.colors) {
                colorData = response.colors;
            } else if (Array.isArray(response)) {
                colorData = response;
            } else if (response.payload && Array.isArray(response.payload)) {
                colorData = response.payload;
            }

            setColors(colorData);
        } catch (error) {
            console.error('Error fetching colors:', error);
            alert('Failed to load colors. Please try again.');
            setColors([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredColors = colors.filter(color =>
        color.colorCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedColor(null);
        setModalMode('add');
        setShowModal(true);
    };

    const handleView = (color) => {
        setSelectedColor(color);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (color) => {
        setSelectedColor(color);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (colorId) => {
        if (window.confirm('Are you sure you want to delete this color?')) {
            try {
                await colorService.deleteColor(colorId);
                setColors(colors.filter(color => color._id !== colorId));
                alert('Color deleted successfully!');
            } catch (error) {
                console.error('Error deleting color:', error);
                alert('Error deleting color');
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
                <p>Loading colors...</p>
            </div>
        );
    }

    return (
        <div className="color-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Color Management</h1>
                    <p>Manage color palette for the application</p>
                </div>
                <div className="header-actions">
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Add Color
                    </button>
                </div>
            </div>

            <div className="color-controls">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search colors by color code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="colors-grid">
                {filteredColors.map((color) => (
                    <div key={color._id} className="color-card">
                        <div
                            className="color-preview"
                            style={{ backgroundColor: color.colorCode }}
                        >
                            <div className="color-overlay">
                                <button
                                    className="action-btn view"
                                    onClick={() => handleView(color)}
                                    title="View Color"
                                >
                                    <FiEye />
                                </button>
                                <button
                                    className="action-btn edit"
                                    onClick={() => handleEdit(color)}
                                    title="Edit Color"
                                >
                                    <FiEdit />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(color._id)}
                                    title="Delete Color"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>

                        <div className="color-info">
                            <h3>{color.colorCode}</h3>
                            <p className="color-date">
                                {formatDate(color.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredColors.length === 0 && !loading && (
                <div className="empty-state">
                    <div className="color-palette-icon">🎨</div>
                    <p>No colors found</p>
                    <button className="add-btn" onClick={handleAdd}>
                        <FiPlus />
                        Add First Color
                    </button>
                </div>
            )}

            {showModal && (
                <ColorModal
                    color={selectedColor}
                    mode={modalMode}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchColors();
                    }}
                />
            )}
        </div>
    );
};

const ColorModal = ({ color, mode, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        colorCode: color?.colorCode || '#000000'
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
                await colorService.addColor(formData);
                alert('Color added successfully!');
            } else if (mode === 'edit') {
                await colorService.updateColor(color._id, formData);
                alert('Color updated successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving color:', error);
            alert('Error saving color');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal color-modal">
                <div className="modal-header">
                    <h3>
                        {mode === 'view' ? 'View Color' :
                            mode === 'edit' ? 'Edit Color' : 'Add New Color'}
                    </h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {mode === 'view' ? (
                        <div className="color-view">
                            <div className="view-color-preview">
                                <div
                                    className="large-color-swatch"
                                    style={{ backgroundColor: color.colorCode }}
                                ></div>
                            </div>
                            <div className="view-info">
                                <h2>{color.colorCode}</h2>
                                <p><strong>Created:</strong> {new Date(color.createdAt).toLocaleString()}</p>
                                {color.updatedAt && (
                                    <p><strong>Updated:</strong> {new Date(color.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="colorCode">Color Code *</label>
                                <div className="color-input-group">
                                    <input
                                        type="color"
                                        id="colorCode"
                                        name="colorCode"
                                        value={formData.colorCode}
                                        onChange={handleChange}
                                        className="color-picker"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="colorCode"
                                        value={formData.colorCode}
                                        onChange={handleChange}
                                        placeholder="#000000"
                                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                        className="color-text-input"
                                        required
                                    />
                                </div>
                                <small>Enter a valid hex color code (e.g., #FF0000 or #F00)</small>
                            </div>

                            <div className="color-preview-section">
                                <label>Preview:</label>
                                <div
                                    className="color-preview-large"
                                    style={{ backgroundColor: formData.colorCode }}
                                ></div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : mode === 'add' ? 'Add Color' : 'Update Color'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Color;
