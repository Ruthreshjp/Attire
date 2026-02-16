import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

const AdminCarousel = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'upload'
    const [newSlide, setNewSlide] = useState({
        type: 'hero',
        imageUrl: '',
        title: '',
        subtitle: '',
        buttonText: 'Shop Now',
        link: '/products',
        isActive: true
    });

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/content/home');
            const data = await response.json();
            if (response.ok && data.carousel) {
                setSlides(data.carousel.map((s, idx) => ({ ...s, id: s.id || idx + 1 })));
            }
        } catch (err) {
            console.error('Error fetching slides:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveToBackend = async (updatedSlides) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    pageName: 'home',
                    carousel: updatedSlides.map(s => ({
                        image: s.image.url,
                        title: s.title,
                        subtitle: s.subtitle,
                        buttonText: s.buttonText,
                        link: s.link,
                        isActive: s.isActive
                    }))
                })
            });
        } catch (err) {
            console.error('Error saving slides:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewSlide({ ...newSlide, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSlide = async (e) => {
        e.preventDefault();
        const slide = {
            ...newSlide,
            id: isEditing ? editingId : Date.now(),
            image: { url: newSlide.imageUrl, alt: newSlide.title }
        };

        let updatedSlides;
        if (isEditing) {
            updatedSlides = slides.map(s => (s.id === editingId ? slide : s));
        } else {
            updatedSlides = [...slides, slide];
        }

        setSlides(updatedSlides);
        await saveToBackend(updatedSlides);

        setIsAdding(false);
        setIsEditing(false);
        setEditingId(null);
        setNewSlide({ type: 'hero', imageUrl: '', title: '', subtitle: '', buttonText: 'Shop Now', link: '/products', isActive: true });
        setUploadMethod('url');
    };

    const handleEdit = (slide) => {
        setNewSlide({
            type: slide.type || 'hero',
            imageUrl: slide.image?.url || slide.image,
            title: slide.title,
            subtitle: slide.subtitle,
            buttonText: slide.buttonText || 'Shop Now',
            link: slide.link || '/products',
            isActive: slide.isActive
        });
        setEditingId(slide.id);
        setIsEditing(true);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this slide?')) {
            const updatedSlides = slides.filter(s => s.id !== id);
            setSlides(updatedSlides);
            await saveToBackend(updatedSlides);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-info">
                        <h1>Edit Home Page</h1>
                        <p>Customize the hero carousel and banner images</p>
                    </div>
                    <button className="add-btn" onClick={() => setIsAdding(true)}>+ Add New Slide</button>
                </header>

                {isAdding && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <div className="modal-header">
                                <h2>{isEditing ? 'Edit Hero Slide' : 'Add Hero Slide'}</h2>
                                <button className="close-btn" onClick={() => {
                                    setIsAdding(false);
                                    setIsEditing(false);
                                    setEditingId(null);
                                    setNewSlide({ type: 'hero', imageUrl: '', title: '', subtitle: '', buttonText: 'Shop Now', link: '/products', isActive: true });
                                }}>×</button>
                            </div>
                            <form onSubmit={handleAddSlide} className="admin-form">
                                <div className="form-group">
                                    <label>Image Source</label>
                                    <div className="upload-tabs">
                                        <button
                                            type="button"
                                            className={`tab-btn ${uploadMethod === 'url' ? 'active' : ''}`}
                                            onClick={() => setUploadMethod('url')}
                                        >
                                            Image URL
                                        </button>
                                        <button
                                            type="button"
                                            className={`tab-btn ${uploadMethod === 'upload' ? 'active' : ''}`}
                                            onClick={() => setUploadMethod('upload')}
                                        >
                                            Upload Image
                                        </button>
                                    </div>
                                </div>

                                {uploadMethod === 'url' ? (
                                    <div className="form-group">
                                        <label>Background Image URL</label>
                                        <input
                                            type="text"
                                            required
                                            value={newSlide.imageUrl}
                                            onChange={(e) => setNewSlide({ ...newSlide, imageUrl: e.target.value })}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Upload Background Image</label>
                                        <div className="file-upload-wrapper">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="file-input"
                                                id="slide-image-upload"
                                            />
                                            <label htmlFor="slide-image-upload" className="file-label">
                                                {newSlide.imageUrl ? "✓ Image Selected" : "📁 Choose File"}
                                            </label>
                                            {newSlide.imageUrl && (
                                                <div className="image-preview-mini">
                                                    <img src={newSlide.imageUrl} alt="Preview" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Main Heading</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSlide.title}
                                        onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                                        placeholder="e.g., Summer Collection 2024"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subtext</label>
                                    <input
                                        type="text"
                                        value={newSlide.subtitle}
                                        onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                                        placeholder="e.g., Get up to 50% off on all accessories"
                                    />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Button Text</label>
                                        <input
                                            type="text"
                                            value={newSlide.buttonText}
                                            onChange={(e) => setNewSlide({ ...newSlide, buttonText: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Link URL</label>
                                        <input
                                            type="text"
                                            value={newSlide.link}
                                            onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
                                    <button type="submit" className="save-btn">Add Slide</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="slides-grid">
                    {slides.map(slide => (
                        <div key={slide.id} className="carousel-admin-card">
                            <div className="slide-preview">
                                <img src={slide.image.url} alt={slide.title} />
                                <div className="slide-overlay">
                                    <h3>{slide.title}</h3>
                                    <p>{slide.subtitle}</p>
                                </div>
                            </div>
                            <div className="slide-actions">
                                <div className="slide-info">
                                    <strong>{slide.type.toUpperCase()} SLIDE</strong>
                                    <span>Status: {slide.isActive ? 'Visible' : 'Hidden'}</span>
                                </div>
                                <div className="btn-group">
                                    <button className="icon-btn" onClick={() => handleEdit(slide)}>✏️</button>
                                    <button className="icon-btn delete" onClick={() => handleDelete(slide.id)}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <style>{`
                .slides-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 30px;
                }
                .carousel-admin-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .slide-preview {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }
                .slide-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .slide-overlay {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    padding: 20px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    color: white;
                }
                .slide-overlay h3 { font-size: 1.1rem; margin-bottom: 4px; }
                .slide-overlay p { font-size: 0.8rem; opacity: 0.8; }
                
                .slide-actions {
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .slide-info { display: flex; flex-direction: column; }
                .slide-info strong { font-size: 0.75rem; color: #1a1a1a; letter-spacing: 1px; }
                .slide-info span { font-size: 0.8rem; color: #666; }
                .locked-badge { font-size: 0.7rem; color: #e53e3e; margin-top: 4px; font-weight: 600; }
                
                .btn-group { display: flex; gap: 10px; min-height: 32px; }

                .upload-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 5px;
                }
                .tab-btn {
                    flex: 1;
                    padding: 10px;
                    background: #f1f1f1;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .tab-btn.active {
                    background: #1a1a1a;
                    color: white;
                    border-color: #1a1a1a;
                }

                .file-upload-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .file-input { display: none; }
                .file-label {
                    display: block;
                    padding: 12px;
                    background: #fff;
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .file-label:hover {
                    border-color: #1a1a1a;
                    background: #fcfcfc;
                }
                .image-preview-mini {
                    width: 100px;
                    height: 60px;
                    border-radius: 4px;
                    overflow: hidden;
                    border: 1px solid #eee;
                }
                .image-preview-mini img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            `}</style>
        </div>
    );
};

export default AdminCarousel;
