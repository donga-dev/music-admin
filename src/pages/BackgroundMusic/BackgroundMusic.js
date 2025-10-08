import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiSearch, FiPlay, FiPause, FiUpload } from "react-icons/fi";
import { backgroundMusicService } from "../../services/backgroundMusicService";
import "./BackgroundMusic.css";

const BackgroundMusic = () => {
  const [backgroundMusic, setBackgroundMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [playingId, setPlayingId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  // Helper function to construct file URLs
  const getFileUrl = (filename) => {
    if (!filename) return null;
    return `https://api.iamwithyouapp.com/api/v1/files/${filename}`;
  };

  const fetchBackgroundMusic = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backgroundMusicService.getBackgroundMusic();

      // Handle the API response structure
      if (response.result === 0 && response.payload?.backgroundMusic) {
        const musicData = response.payload.backgroundMusic.map((track) => ({
          ...track,
          // Construct full image URL if image exists
          image: getFileUrl(track.image),
          // Construct full file URL if file exists
          file: getFileUrl(track.file),
        }));
        setBackgroundMusic(musicData);
      } else {
        console.error("Unexpected API response structure:", response);
        setBackgroundMusic([]);
      }
    } catch (error) {
      console.error("Error fetching background music:", error);
      setBackgroundMusic([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackgroundMusic();
  }, [fetchBackgroundMusic]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  const filteredMusic = backgroundMusic.filter((track) =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (window.confirm("Are you sure you want to delete this background music?")) {
      try {
        await backgroundMusicService.deleteBackgroundMusic(musicId);
        setBackgroundMusic(backgroundMusic.filter((track) => track._id !== musicId));
      } catch (error) {
        console.error("Error deleting background music:", error);
        alert("Error deleting background music");
      }
    }
  };

  const handlePlay = (track) => {
    if (playingId === track._id) {
      // Pause current track
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingId(null);
    } else {
      // Stop previous track if any
      if (audioElement) {
        audioElement.pause();
      }

      // Play new track if file exists
      if (track.file) {
        const audio = new Audio(track.file);
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          alert("Error playing audio file");
        });

        audio.addEventListener("ended", () => {
          setPlayingId(null);
          setAudioElement(null);
        });

        setAudioElement(audio);
        setPlayingId(track._id);
      } else {
        alert("Audio file not available");
      }
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
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
        <p>Loading background music...</p>
      </div>
    );
  }

  return (
    <div className="background-music-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Background Music</h1>
          <p>Manage ambient and background music tracks</p>
        </div>
        <button
          className="add-btn"
          onClick={handleAdd}
        >
          <FiPlus />
          Add Background Music
        </button>
      </div>

      <div className="music-controls">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search background music..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="music-grid">
        {filteredMusic.map((track) => (
          <div
            key={track._id}
            className="music-card"
          >
            <div className="music-image">
              {track.image ? (
                <img
                  src={track.image}
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
                <FiUpload size={40} />
              </div>
              <div className="play-overlay">
                <button
                  className="play-button"
                  onClick={() => handlePlay(track)}
                >
                  {playingId === track._id ? <FiPause size={24} /> : <FiPlay size={24} />}
                </button>
              </div>
            </div>

            <div className="music-content">
              <h3>{track.title}</h3>
              <p className="duration">{formatDuration(parseInt(track.duration))}</p>
              <p className="added-date">Added: {formatDate(track.createdAt)}</p>
            </div>

            <div className="music-actions">
              <button
                className="action-btn edit"
                onClick={() => handleEdit(track)}
                title="Edit Background Music"
              >
                ✏️
              </button>
              <button
                className="action-btn delete"
                onClick={() => handleDelete(track._id)}
                title="Delete Background Music"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMusic.length === 0 && !loading && (
        <div className="empty-state">
          <FiUpload size={60} />
          <p>No background music found</p>
          <button
            className="add-btn"
            onClick={handleAdd}
          >
            <FiPlus />
            Add First Track
          </button>
        </div>
      )}

      {showModal && (
        <BackgroundMusicModal
          music={selectedMusic}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchBackgroundMusic();
          }}
        />
      )}
    </div>
  );
};

const BackgroundMusicModal = ({ music, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: music?.title || "",
    duration: music?.duration || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(music?.image || null);
  const [musicFileName, setMusicFileName] = useState("");

  // Set initial music file name for existing music
  useEffect(() => {
    if (music && music.file) {
      setMusicFileName(music.file);
    }
  }, [music]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === "image") {
      setImageFile(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (fileType === "music") {
      setMusicFile(file);
      setMusicFileName(file ? file.name : "");

      // Auto-detect duration if possible
      if (file) {
        const audio = document.createElement("audio");
        audio.src = URL.createObjectURL(file);
        audio.addEventListener("loadedmetadata", () => {
          setFormData((prev) => ({
            ...prev,
            duration: Math.floor(audio.duration).toString(),
          }));
        });
      }
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
        await backgroundMusicService.addBackgroundMusic(submitData);
      } else {
        await backgroundMusicService.updateBackgroundMusic(music._id, submitData);
      }

      onSave();
    } catch (error) {
      console.error("Error saving background music:", error);
      alert("Error saving background music");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal background-music-modal">
        <div className="modal-header">
          <h3>{mode === "add" ? "Add Background Music" : "Edit Background Music"}</h3>
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
              <label htmlFor="title">Track Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter track title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (seconds)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Enter duration in seconds"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Cover Image</label>
              <div className="file-upload-area">
                {imagePreview && (
                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                    />
                  </div>
                )}
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
                  required={mode === "add"}
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

export default BackgroundMusic;
