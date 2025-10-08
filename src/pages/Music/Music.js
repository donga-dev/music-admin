import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiSearch, FiPlay, FiPause, FiUpload } from "react-icons/fi";
import { musicService } from "../../services/musicService";
import { categoryService } from "../../services/categoryService";
import CustomDropdown from "../../components/CustomDropdown";
import "./Music.css";

const Music = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const actionProcessedRef = useRef(false);
  const musicFetchedRef = useRef(false);
  const audioRef = useRef(null);
  const [music, setMusic] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [playingId, setPlayingId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null); // Track currently playing (for debugging/future use)

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories(true); // Pass true to get all categories

      if (response.result === 0) {
        setCategories(response.payload.category || []);
        console.log("Categories loaded:", response.payload.category?.length || 0);
      } else {
        console.error("Categories API returned error:", response.message);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      console.error("Categories error details:", error.response?.data || error.message);
      setCategories([]);
    }
  };

  const fetchMusic = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedCategory && { categoryId: selectedCategory }),
      };

      const response = await musicService.getMusic(params);
      console.log("Music response:", response);

      if (response.result === 0) {
        // Map the API response to include categoryName from categories state
        const musicWithCategoryNames = response.payload.music.map((track) => {
          const category = categories.find((cat) => cat._id === track.categoryId);
          return {
            ...track,
            categoryName: category ? category.name : "Unknown",
            duration: track.duration.toString(), // Ensure duration is string for consistency
          };
        });

        setMusic(musicWithCategoryNames);
        console.log("Music loaded:", musicWithCategoryNames.length, "tracks");

        // Calculate total pages based on count and limit
        const totalCount = response.payload.count || 0;
        const calculatedPages = Math.ceil(totalCount / 10);
        setTotalPages(calculatedPages);
      } else {
        console.error("Music API returned error:", response.message);
        setMusic([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching music:", error);
      console.error("Music error details:", error.response?.data || error.message);
      setMusic([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Check if we should open the modal from URL parameter
    const action = searchParams.get("action");
    if (action === "add" && !actionProcessedRef.current) {
      actionProcessedRef.current = true;
      setShowModal(true);
      setModalMode("add");
      setSelectedMusic(null);
      // Remove the action parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Fetch music when dependencies change, but only once per change
  useEffect(() => {
    if (categories.length > 0 && !musicFetchedRef.current) {
      musicFetchedRef.current = true;
      fetchMusic();
    }
  }, [fetchMusic, categories.length]);

  // Reset the flag when page or category filter changes
  useEffect(() => {
    musicFetchedRef.current = false;
  }, [currentPage, selectedCategory]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  // Log current track changes for debugging
  useEffect(() => {
    if (currentTrack) {
      console.log("Current track updated:", currentTrack.title);
    }
  }, [currentTrack]);

  const filteredMusic = music.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.musicBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedMusic(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleEdit = (track) => {
    setSelectedMusic(track);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (musicId) => {
    if (window.confirm("Are you sure you want to delete this music track?")) {
      try {
        await musicService.deleteMusic(musicId);
        setMusic(music.filter((track) => track._id !== musicId));
      } catch (error) {
        console.error("Error deleting music:", error);
        alert("Error deleting music track");
      }
    }
  };

  const handlePremiumToggle = async (musicId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await musicService.updatePremiumStatus(musicId, newStatus);

      // Update the local state
      setMusic(
        music.map((track) => (track._id === musicId ? { ...track, isSubscribe: newStatus } : track))
      );
    } catch (error) {
      console.error("Error updating premium status:", error);
      alert("Error updating premium status");
    }
  };

  // Helper function to construct file URLs
  const getFileUrl = (filename) => {
    if (!filename) return null;
    return `https://api.iamwithyouapp.com/api/v1/files/${filename}`;
  };

  const handlePlay = (track) => {
    if (playingId === track._id) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      setCurrentTrack(null);
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const musicUrl = getFileUrl(track.file);
      if (musicUrl) {
        audioRef.current.src = musicUrl;
        audioRef.current.play().catch((error) => {
          console.error("Error playing music:", error);
          alert("Error playing music. Please check if the file exists.");
        });
        setPlayingId(track._id);
        setCurrentTrack(track);
        console.log("Now playing:", track.title);
      } else {
        alert("Music file not found");
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
      {/* Audio element for music playback */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setPlayingId(null);
          setCurrentTrack(null);
        }}
        onError={(e) => {
          console.error("Audio error:", e);
          setPlayingId(null);
          setCurrentTrack(null);
        }}
      />

      <div className="page-header">
        <div className="header-content">
          <h1>Music Management</h1>
          <p>Manage your music library</p>
        </div>
        <button
          className="add-btn"
          onClick={handleAdd}
        >
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
          <CustomDropdown
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((category) => ({
                value: category._id,
                label: category.name,
              })),
            ]}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="All Categories"
          />
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
                        <img
                          src={getFileUrl(track.image)}
                          alt={track.title}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="default-image"
                        style={{ display: track.image ? "none" : "flex" }}
                      >
                        ♪
                      </div>
                    </div>
                    <div className="track-details">
                      <span className={`track-title ${playingId === track._id ? "playing" : ""}`}>
                        {track.title}
                        {playingId === track._id && <span className="playing-indicator">♪</span>}
                      </span>
                      <button
                        className={`play-btn ${playingId === track._id ? "playing" : ""}`}
                        onClick={() => handlePlay(track)}
                      >
                        {playingId === track._id ? <FiPause /> : <FiPlay />}
                      </button>
                    </div>
                  </div>
                </td>
                <td>{track.musicBy}</td>
                <td>
                  <span className="category-badge">{track.categoryName}</span>
                </td>
                <td>{formatDuration(parseInt(track.duration))}</td>
                <td>
                  <div className="premium-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={track.isSubscribe}
                        onChange={() => handlePremiumToggle(track._id, track.isSubscribe)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="toggle-label">{track.isSubscribe ? "Premium" : "Free"}</span>
                  </div>
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
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
    title: music?.title || "",
    musicBy: music?.musicBy || "",
    duration: music?.duration || "",
    categoryId: music?.categoryId || "",
    isSubscribe: music?.isSubscribe || false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [musicFileName, setMusicFileName] = useState("");
  const [saving, setSaving] = useState(false);

  // Set initial preview for existing music
  useEffect(() => {
    if (music) {
      if (music.image) {
        setImagePreview(`https://api.iamwithyouapp.com/api/v1/files/${music.image}`);
      }
      if (music.file) {
        setMusicFileName(music.file);
      }
    }
  }, [music]);

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
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (fileType === "music") {
      setMusicFile(file);
      setMusicFileName(file ? file.name : "");
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

      if (mode === "add") {
        await musicService.addMusic(submitData);
      } else {
        await musicService.updateMusic(music._id, submitData);
      }

      onSave();
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
          <h3>{mode === "add" ? "Add New Music" : "Edit Music"}</h3>
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
                <CustomDropdown
                  options={categories.map((category) => ({
                    value: category._id,
                    label: category.name,
                  }))}
                  value={formData.categoryId}
                  onChange={(value) => setFormData({ ...formData, categoryId: value })}
                  placeholder="Select Category"
                />
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
              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                  />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      document.getElementById("image").value = "";
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
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
              {musicFileName && (
                <div className="file-name-display">
                  <span className="file-name">
                    {musicFile ? `Selected: ${musicFileName}` : `Current: ${musicFileName}`}
                  </span>
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => {
                      setMusicFileName("");
                      setMusicFile(null);
                      document.getElementById("file").value = "";
                    }}
                  >
                    {musicFile ? "Remove File" : "Replace File"}
                  </button>
                </div>
              )}
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
                {saving ? "Saving..." : mode === "add" ? "Add Track" : "Update Track"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Music;
