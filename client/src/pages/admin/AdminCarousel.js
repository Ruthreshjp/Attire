import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

const AdminCarousel = () => {
    const [slides, setSlides] = useState([
        { id: 1, type: 'hero', image: { url: 'https://images.unsplash.com/photo-1507679799987-c7377ec48696?w=1600&q=80' }, title: 'Elevate Your Style', subtitle: 'Premium Accessories', isActive: true },
        { id: 2, type: 'hero', image: { url: 'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=1600&q=80' }, title: 'The Modern Gentleman', subtitle: 'Crafted for Perfection', isActive: true }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newSlide, setNewSlide] = useState({
        type: 'hero',
        imageUrl: '',
        title: '',
        subtitle: '',
        buttonText: 'Shop Now',
        link: '/products',
        isActive: true
    });

    const handleAddSlide = (e) => {
        e.preventDefault();
        const slide = {
            ...newSlide,
            id: Date.now(),
            image: { url: newSlide.imageUrl, alt: newSlide.title }
        };
        setSlides([...slides, slide]);
        setIsAdding(false);
        setNewSlide({ type: 'hero', imageUrl: '', title: '', subtitle: '', buttonText: 'Shop Now', link: '/products', isActive: true });
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
                                <h2>Add Hero Slide</h2>
                                <button className="close-btn" onClick={() => setIsAdding(false)}>×</button>
                            </div>
                            <form onSubmit={handleAddSlide} className="admin-form">
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
                                    <button className="icon-btn">✏️</button>
                                    <button className="icon-btn delete">🗑️</button>
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
                
                .btn-group { display: flex; gap: 10px; }
            `}</style>
        </div>
    );
};

export default AdminCarousel;
