import React, { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import { musicService } from "../services/musicService";
import { categoryService } from "../services/categoryService";
import { userService } from "../services/userService";
import { notesService } from "../services/notesService";
import { notesCategoryService } from "../services/notesCategoryService";
import { FiUpload } from "react-icons/fi";

const ModalRenderer = () => {
  const { modalState, closeModal } = useModal();
  const [categories, setCategories] = useState([]);
  const [noteCategories, setNoteCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalState.isOpen && (modalState.type === "music" || modalState.type === "category")) {
      fetchMusicCategories();
    }
    if (modalState.isOpen && modalState.type === "note") {
      fetchNoteCategories();
    }
  }, [modalState.isOpen, modalState.type]);

  const fetchMusicCategories = async () => {
    try {
      const response = await categoryService.getCategories(true);
      if (response.result === 0) {
        setCategories(response.payload.category || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchNoteCategories = async () => {
    try {
      const response = await notesCategoryService.getNoteCategories(true);
      if (response.result === 0) {
        setNoteCategories(response.payload.noteCategory || []);
      }
    } catch (error) {
      console.error("Error fetching note categories:", error);
    }
  };

  const renderModal = () => {
    if (!modalState.isOpen) return null;

    switch (modalState.type) {
      case "music":
        return (
          <MusicModal
            onClose={closeModal}
            categories={categories}
          />
        );
      case "category":
        return <CategoryModal onClose={closeModal} />;
      case "user":
        return <UserModal onClose={closeModal} />;
      case "note":
        return (
          <NoteModal
            onClose={closeModal}
            categories={noteCategories}
          />
        );
      default:
        return null;
    }
  };

  return renderModal();
};

// Music Modal Component
const MusicModal = ({ onClose, categories }) => {
  const [formData, setFormData] = useState({
    title: "",
    musicBy: "",
    duration: "",
    categoryId: "",
    isSubscribe: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === "image") {
      setImageFile(file);
    } else if (fileType === "music") {
      setMusicFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      if (musicFile) {
        submitData.append("file", musicFile);
      }

      await musicService.addMusic(submitData);
      onClose();
    } catch (error) {
      console.error("Error saving music:", error);
      alert("Error saving music track");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal music-modal">
        <div className="modal-header">
          <h3>Add New Music</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
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
                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Cover Image</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                />
                <div className="upload-text">
                  <FiUpload />
                  <span>Click to upload image or drag and drop</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="file">Music File</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, "music")}
                />
                <div className="upload-text">
                  <FiUpload />
                  <span>Click to upload audio file or drag and drop</span>
                  <small>Supported formats: MP3, WAV, OGG</small>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isSubscribe"
                  checked={formData.isSubscribe}
                  onChange={handleChange}
                />
                <span>Premium Content</span>
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Track"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await categoryService.addCategory(formData.name);
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Category</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
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
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={saving || !formData.name.trim()}
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// User Modal Component
const UserModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userService.createUser(formData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New User</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Note Modal Component
const NoteModal = ({ onClose, categories }) => {
  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    categoryId: "",
    mood: "📝",
  });
  const [saving, setSaving] = useState(false);

  const moodOptions = ["😊", "😢", "😡", "😍", "🤔", "💡", "📝", "🎵", "🏔️", "🌟", "❤️", "🚀"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await notesService.addNotes(formData);
      onClose();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Error saving note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal notes-modal">
        <div className="modal-header">
          <h3>Add New Note</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
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
                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mood">Mood</label>
                <div className="mood-selector">
                  {moodOptions.map((moodOption) => (
                    <button
                      key={moodOption}
                      type="button"
                      className={`mood-btn ${formData.mood === moodOption ? "active" : ""}`}
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
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalRenderer;
