import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

// Reusable Image Input with URL/Upload toggle
const ImageInput = ({ label, value, onChange, idPrefix }) => {
    const [method, setMethod] = useState('url');

    const onFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onChange(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="upload-tabs" style={{ marginBottom: '10px' }}>
                <button type="button" className={`tab-btn ${method === 'url' ? 'active' : ''}`} onClick={() => setMethod('url')}>URL</button>
                <button type="button" className={`tab-btn ${method === 'upload' ? 'active' : ''}`} onClick={() => setMethod('upload')}>Files</button>
            </div>
            {method === 'url' ? (
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
            ) : (
                <div className="file-upload-wrapper">
                    <input type="file" accept="image/*" id={idPrefix} style={{ display: 'none' }} onChange={onFile} />
                    <label htmlFor={idPrefix} className="file-label">
                        {value && (value.startsWith('data:') || value.length > 100) ? "✓ Image Ready" : "📁 Select Image"}
                    </label>
                </div>
            )}
        </div>
    );
};

const DEFAULT_HOME_CONTENT = {
    brandPhilosophy: {
        subtitle: 'The Art of Attire',
        title: 'Elegance in Every Detail',
        description: 'At ATTIRE, we believe that fashion is a silent language...',
        image: '',
        stats: [
            { number: '100%', label: 'Premium Material' },
            { number: '24h', label: 'Express Checkout' },
            { number: '5k+', label: 'Happy Clients' }
        ]
    },
    newsletter: {
        title: 'Join The Club',
        description: 'Receive exclusive early access to new collections and luxury fashion insights.'
    },
    categories: [
        { label: 'Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', link: '/products?category=Shirts' },
        { label: 'Pants', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', link: '/products?category=Pants' },
        { label: 'Track', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80', link: '/products?category=Track' },
        { label: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', link: '/products?category=T-Shirts' },
        { label: 'Belts', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', link: '/products?category=Belts' },
        { label: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', link: '/products?category=Jeans' },
        { label: 'Kurta', image: 'https://images.unsplash.com/photo-1610414316335-97836802f067?w=600&q=80', link: '/products?category=Kurta' },
        { label: 'Shorts', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', link: '/products?category=Shorts' },
        { label: 'Half Trousers', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', link: '/products?category=Half%20Trousers' },
        { label: 'Sleeveless', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80', link: '/products?category=Sleeveless' }
    ]
};

const AdminCarousel = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
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

    const [homeContent, setHomeContent] = useState(DEFAULT_HOME_CONTENT);
    const [isDirty, setIsDirty] = useState(false);

    const markDirty = () => setIsDirty(true);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/content/home');
            const data = await response.json();
            if (response.ok && data) {
                if (data.carousel) {
                    setSlides(data.carousel.map((s, idx) => ({ ...s, id: s.id || idx + 1 })));
                }
                setHomeContent({
                    brandPhilosophy: data.brandPhilosophy || DEFAULT_HOME_CONTENT.brandPhilosophy,
                    newsletter: data.newsletter || DEFAULT_HOME_CONTENT.newsletter,
                    categories: (data.categories && data.categories.length > 0)
                        ? data.categories
                        : DEFAULT_HOME_CONTENT.categories
                });
            }
        } catch (err) {
            console.error('Error fetching slides:', err);
            alert('Critial: Could not fetch home page content from server. Please check if the backend is running on port 5000.');
        } finally {
            setLoading(false);
        }
    };

    const saveToBackend = async (currentSlides, currentContent = null) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
            return;
        }

        const contentToSave = currentContent || homeContent;
        const slidesToSave = currentSlides || slides;

        console.log('Initiating save operation...', { slidesToSave, contentToSave });

        setSaving(true);
        try {
            // Validate stats array structure
            const sanitizedStats = (contentToSave.brandPhilosophy?.stats || []).map(s => ({
                number: s.number || '',
                label: s.label || ''
            }));

            const response = await fetch('http://localhost:5000/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    pageName: 'home',
                    carousel: slidesToSave.map(s => ({
                        image: s.image?.url || s.image || s.imageUrl || '',
                        title: s.title || '',
                        subtitle: s.subtitle || '',
                        buttonText: s.buttonText || 'Shop Now',
                        link: s.link || '/products',
                        isActive: s.isActive !== undefined ? s.isActive : true
                    })),
                    brandPhilosophy: {
                        subtitle: contentToSave.brandPhilosophy.subtitle || '',
                        title: contentToSave.brandPhilosophy.title || '',
                        description: contentToSave.brandPhilosophy.description || '',
                        image: contentToSave.brandPhilosophy.image || '',
                        stats: sanitizedStats
                    },
                    newsletter: {
                        title: contentToSave.newsletter.title || '',
                        description: contentToSave.newsletter.description || ''
                    },
                    categories: contentToSave.categories.map(c => ({
                        label: c.label || '',
                        image: c.image || '',
                        link: c.link || ''
                    }))
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server responded with ' + response.status }));
                throw new Error(errorData.message || errorData.msg || 'Save failed');
            }

            const data = await response.json();
            console.log('Save successful:', data);

            // Update local state with server response to ensure synchronization
            if (data.carousel) {
                setSlides(data.carousel.map((s, idx) => ({ ...s, id: s.id || idx + 1 })));
            }
            if (data.brandPhilosophy || data.newsletter || data.categories) {
                setHomeContent({
                    brandPhilosophy: data.brandPhilosophy || DEFAULT_HOME_CONTENT.brandPhilosophy,
                    newsletter: data.newsletter || DEFAULT_HOME_CONTENT.newsletter,
                    categories: (data.categories && data.categories.length > 0)
                        ? data.categories
                        : DEFAULT_HOME_CONTENT.categories
                });
            }

            setIsDirty(false);
            alert('✨ Success: Home page content updated successfully!');
        } catch (err) {
            console.error('Save error details:', err);
            alert('Failed to save changes: ' + err.message);
        } finally {
            setSaving(false);
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
        const imgUrl = slide.image?.url || slide.image || slide.imageUrl;
        setNewSlide({
            type: slide.type || 'hero',
            imageUrl: imgUrl,
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
                        <h1>Home Page</h1>
                        <p>Manage hero slides, brand philosophy, and newsletter content</p>
                    </div>
                    {!isAdding && <button className="add-btn" onClick={() => setIsAdding(true)}>+ Create New Hero Slide</button>}
                </header>

                {isAdding && (
                    <section className="admin-section-block slide-editor-section">
                        <header className="section-header-admin">
                            <h2>{isEditing ? 'Editing Slide' : 'Create New Hero Slide'}</h2>
                            <p>Configure appearance, content, and destination for this slide</p>
                        </header>

                        <form onSubmit={handleAddSlide} className="admin-form-inline">
                            <div className="editor-grid">
                                <div className="editor-left">
                                    <div className="form-group">
                                        <label>Image Source</label>
                                        <div className="upload-tabs">
                                            <button
                                                type="button"
                                                className={`tab-btn ${uploadMethod === 'url' ? 'active' : ''}`}
                                                onClick={() => setUploadMethod('url')}
                                            >
                                                URL
                                            </button>
                                            <button
                                                type="button"
                                                className={`tab-btn ${uploadMethod === 'upload' ? 'active' : ''}`}
                                                onClick={() => setUploadMethod('upload')}
                                            >
                                                Files
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
                                                    {newSlide.imageUrl ? "✓ Image Ready" : "📁 Select from Device"}
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Main Heading (Hero Title)</label>
                                        <input
                                            type="text"
                                            required
                                            value={newSlide.title}
                                            onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                                            placeholder="Luxury Collection 2026"
                                        />
                                    </div>
                                </div>

                                <div className="editor-right">
                                    <div className="form-group">
                                        <label>Subtext Description</label>
                                        <input
                                            type="text"
                                            value={newSlide.subtitle}
                                            onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                                            placeholder="Discover the art of modern fashion"
                                        />
                                    </div>

                                    <div className="form-grid-compact">
                                        <div className="form-group">
                                            <label>Button Label</label>
                                            <input
                                                type="text"
                                                value={newSlide.buttonText}
                                                onChange={(e) => setNewSlide({ ...newSlide, buttonText: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Destination Route</label>
                                            <input
                                                type="text"
                                                value={newSlide.link}
                                                onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {newSlide.imageUrl && (
                                        <div className="editor-preview-box">
                                            <label>Visual Preview</label>
                                            <div className="preview-image-container">
                                                <img src={newSlide.imageUrl} alt="Preview" />
                                                <div className="preview-overlay">
                                                    <span>{newSlide.title || 'Heading'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="editor-actions">
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setIsAdding(false);
                                    setIsEditing(false);
                                    setEditingId(null);
                                    setNewSlide({ type: 'hero', imageUrl: '', title: '', subtitle: '', buttonText: 'Shop Now', link: '/products', isActive: true });
                                }}>Discard Changes</button>
                                <button type="submit" className="save-btn">{isEditing ? 'Update Slide' : 'Publish Slide'}</button>
                            </div>
                        </form>
                    </section>
                )}

                <div className="home-sections-editor">
                    <section className="admin-section-block slide-list-section">
                        <header className="section-header-admin">
                            <h2>Active Carousel Slides</h2>
                            <p>Manage the order and visibility of slides on your home page</p>
                        </header>

                        <div className="slides-grid">
                            {slides.map(slide => (
                                <div key={slide.id} className="carousel-admin-card">
                                    <div className="slide-preview">
                                        <img src={slide.image?.url || slide.image || slide.imageUrl} alt={slide.title} />
                                        <div className="slide-overlay">
                                            <h3>{slide.title}</h3>
                                            <p>{slide.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="slide-actions">
                                        <div className="slide-info">
                                            <strong>{(slide.type || 'hero').toUpperCase()} SLIDE</strong>
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
                    </section>

                    <section className="admin-section-block category-grid-editor">
                        <header className="section-header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2>Our Products Grid</h2>
                                <p>Manage the 10 categories displayed in the main grid (2 rows of 5)</p>
                            </div>
                            <button
                                className="save-btn"
                                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                                onClick={() => saveToBackend(slides)}
                            >
                                Save Grid Changes
                            </button>
                        </header>

                        <div className="categories-edit-grid">
                            {homeContent.categories.map((cat, idx) => (
                                <div key={idx} className="category-edit-card">
                                    <div className="card-header-admin">
                                        <h4>Slot {idx + 1}: {cat.label}</h4>
                                    </div>
                                    <div className="card-body-admin">
                                        <div className="form-group">
                                            <label>Label</label>
                                            <input
                                                type="text"
                                                value={cat.label}
                                                onChange={(e) => {
                                                    const newCategories = homeContent.categories.map((c, i) =>
                                                        i === idx ? { ...c, label: e.target.value } : c
                                                    );
                                                    setHomeContent({ ...homeContent, categories: newCategories });
                                                    markDirty();
                                                }}
                                            />
                                        </div>

                                        <ImageInput
                                            label="Category Image"
                                            value={cat.image}
                                            idPrefix={`cat-img-${idx}`}
                                            onChange={(val) => {
                                                const newCategories = homeContent.categories.map((c, i) =>
                                                    i === idx ? { ...c, image: val } : c
                                                );
                                                setHomeContent({ ...homeContent, categories: newCategories });
                                                markDirty();
                                            }}
                                        />

                                        <div className="form-group">
                                            <label>Link Path</label>
                                            <input
                                                type="text"
                                                value={cat.link}
                                                placeholder="/products?category=..."
                                                onChange={(e) => {
                                                    const newCategories = homeContent.categories.map((c, i) =>
                                                        i === idx ? { ...c, link: e.target.value } : c
                                                    );
                                                    setHomeContent({ ...homeContent, categories: newCategories });
                                                    markDirty();
                                                }}
                                            />
                                        </div>
                                        {cat.image && (
                                            <div className="cat-preview-mini">
                                                <img src={cat.image} alt="preview" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="admin-section-block philosophy-section">
                        <header className="section-header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2>Brand Philosophy Section</h2>
                                <p>Customize the storytelling area of your home page</p>
                            </div>
                            <button
                                className="save-btn"
                                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                                onClick={() => saveToBackend(slides)}
                            >
                                Save Philosophy
                            </button>
                        </header>
                        <div className="admin-form-compact">
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Small Subtitle</label>
                                    <input
                                        type="text"
                                        value={homeContent.brandPhilosophy.subtitle}
                                        onChange={(e) => {
                                            setHomeContent({
                                                ...homeContent,
                                                brandPhilosophy: { ...homeContent.brandPhilosophy, subtitle: e.target.value }
                                            });
                                            markDirty();
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Main Heading</label>
                                    <input
                                        type="text"
                                        value={homeContent.brandPhilosophy.title}
                                        onChange={(e) => {
                                            setHomeContent({
                                                ...homeContent,
                                                brandPhilosophy: { ...homeContent.brandPhilosophy, title: e.target.value }
                                            });
                                            markDirty();
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description Paragraph</label>
                                <textarea
                                    rows="4"
                                    value={homeContent.brandPhilosophy.description}
                                    onChange={(e) => {
                                        setHomeContent({
                                            ...homeContent,
                                            brandPhilosophy: { ...homeContent.brandPhilosophy, description: e.target.value }
                                        });
                                        markDirty();
                                    }}
                                ></textarea>
                            </div>

                            <ImageInput
                                label="Philosophy Hero Image"
                                value={homeContent.brandPhilosophy.image}
                                idPrefix="phil-img"
                                onChange={(val) => {
                                    setHomeContent({
                                        ...homeContent,
                                        brandPhilosophy: { ...homeContent.brandPhilosophy, image: val }
                                    });
                                    markDirty();
                                }}
                            />

                            <div className="form-stats-manager">
                                <label>Key Stats</label>
                                <div className="stats-grid-admin">
                                    {homeContent.brandPhilosophy.stats.map((stat, idx) => (
                                        <div key={idx} className="stat-edit-box">
                                            <input
                                                type="text"
                                                placeholder="Number"
                                                value={stat.number}
                                                onChange={(e) => {
                                                    const newStats = homeContent.brandPhilosophy.stats.map((s, i) =>
                                                        i === idx ? { ...s, number: e.target.value } : s
                                                    );
                                                    setHomeContent({ ...homeContent, brandPhilosophy: { ...homeContent.brandPhilosophy, stats: newStats } });
                                                    markDirty();
                                                }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Label"
                                                value={stat.label}
                                                onChange={(e) => {
                                                    const newStats = homeContent.brandPhilosophy.stats.map((s, i) =>
                                                        i === idx ? { ...s, label: e.target.value } : s
                                                    );
                                                    setHomeContent({ ...homeContent, brandPhilosophy: { ...homeContent.brandPhilosophy, stats: newStats } });
                                                    markDirty();
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="admin-section-block newsletter-section">
                        <header className="section-header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2>Newsletter Section</h2>
                                <p>Control the newsletter signup messaging</p>
                            </div>
                            <button
                                className="save-btn"
                                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                                onClick={() => saveToBackend(slides)}
                            >
                                Save Newsletter
                            </button>
                        </header>
                        <div className="admin-form-compact">
                            <div className="form-group">
                                <label>Newsletter Heading</label>
                                <input
                                    type="text"
                                    value={homeContent.newsletter.title}
                                    onChange={(e) => {
                                        setHomeContent({
                                            ...homeContent,
                                            newsletter: { ...homeContent.newsletter, title: e.target.value }
                                        });
                                        markDirty();
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Newsletter Description</label>
                                <input
                                    type="text"
                                    value={homeContent.newsletter.description}
                                    onChange={(e) => {
                                        setHomeContent({
                                            ...homeContent,
                                            newsletter: { ...homeContent.newsletter, description: e.target.value }
                                        });
                                        markDirty();
                                    }}
                                />
                            </div>
                        </div>
                    </section>


                    {isDirty && (
                        <div className="sticky-footer-save">
                            <p>{saving ? '🚀 Deploying changes...' : '⚠️ You have unsaved changes in the page content'}</p>
                            <div className="btn-group">
                                {saving ? (
                                    <button className="save-btn large disabled" disabled>Saving...</button>
                                ) : (
                                    <>
                                        <button className="cancel-btn" onClick={() => { fetchSlides(); setIsDirty(false); }}>Discard Changes</button>
                                        <button
                                            className="save-btn large"
                                            onClick={() => saveToBackend(slides)}
                                        >
                                            Save All Home Page Changes
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .admin-section-block {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    margin-bottom: 50px;
                    border: 1px solid #f0f0f0;
                    transition: all 0.3s ease;
                }
                .admin-section-block:hover {
                    box-shadow: 0 10px 40px rgba(0,0,0,0.06);
                    border-color: #c5a059;
                }
                .slide-editor-section {
                    background: #fffcf5;
                    border: 1px solid #c5a05933;
                }
                .slide-list-section {
                    background: #ffffff;
                }
                .philosophy-section {
                    background: #f9fbfc;
                }
                .newsletter-section {
                    background: #fffafa;
                }
                
                .admin-form-inline {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }
                
                .editor-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
                
                .form-grid-compact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                
                .editor-preview-box {
                    margin-top: 20px;
                }
                
                .preview-image-container {
                    margin-top: 10px;
                    height: 120px;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }
                
                .preview-image-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .preview-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.4);
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                
                .editor-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }

                .slide-editor-section {
                    background: #fcfcfc;
                    border: 2px solid #c5a05933;
                }
                
                .home-sections-editor {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    width: 100%;
                    max-width: 1200px;
                    padding-bottom: 100px;
                }
                .section-header-admin {
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                .section-header-admin h2 { font-size: 1.3rem; margin-bottom: 5px; color: #1a1a1a; }
                .section-header-admin p { font-size: 0.9rem; color: #666; }
                
                .admin-form-compact { display: flex; flex-direction: column; gap: 20px; }
                .form-group-row { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
                
                .form-stats-manager { margin-top: 10px; }
                .stats-grid-admin {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-top: 10px;
                }
                .stat-edit-box {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    border: 1px solid #eee;
                }
                .stat-edit-box input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.85rem;
                }
                
                .sticky-footer-save {
                    position: fixed;
                    bottom: 0;
                    right: 0;
                    left: 280px; /* modified sidebar width */
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 20px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
                    z-index: 9999;
                    border-top: 1px solid rgba(197, 160, 89, 0.2);
                }
                .sticky-footer-save p { font-weight: 600; color: #c5a059; }

                .slides-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 25px;
                    margin-top: 10px;
                }
                .carousel-admin-card {
                    background: #f8f9fa;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #eee;
                }
                .slide-preview {
                    position: relative;
                    height: 180px;
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
                    padding: 15px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    color: white;
                }
                .slide-overlay h3 { font-size: 1rem; margin-bottom: 2px; }
                .slide-overlay p { font-size: 0.75rem; opacity: 0.8; }
                
                .slide-actions {
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                }
                .slide-info { display: flex; flex-direction: column; }
                .slide-info strong { font-size: 0.7rem; color: #888; letter-spacing: 1px; }
                .slide-info span { font-size: 0.8rem; color: #1a1a1a; font-weight: 600; }
                
                .btn-group { display: flex; gap: 8px; }

                .upload-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 5px;
                }
                .tab-btn {
                    flex: 1;
                    padding: 8px;
                    background: #eee;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.75rem;
                    color: #666;
                }
                .tab-btn.active {
                    background: #1a1a1a;
                    color: white;
                }

                .file-upload-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .file-label {
                    display: block;
                    padding: 12px;
                    background: #fff;
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .categories-edit-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 30px;
                }
                .category-edit-card {
                    background: #f8f9fa;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .card-header-admin {
                    padding: 12px 20px;
                    background: #fff;
                    border-bottom: 1px solid #eee;
                }
                .card-header-admin h4 { margin: 0; font-size: 0.9rem; color: #333; }
                .card-body-admin { padding: 20px; }
                .cat-preview-mini {
                    margin-top: 15px;
                    width: 100%;
                    height: 120px;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #ddd;
                }
                .cat-preview-mini img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                @media (max-width: 768px) {
                    .categories-edit-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AdminCarousel;
