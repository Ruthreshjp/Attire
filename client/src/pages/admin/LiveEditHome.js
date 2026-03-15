import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { EditableText, EditableImage } from '../../components/Editable';
import { DEFAULT_HOME_DATA } from '../../utils/defaultContent';
import HeroCarousel from '../../components/HeroCarousel';
import ProductQueue from '../../components/ProductQueue';
import Navbar from '../../components/Navbar';
import './LiveEdit.css';

const LiveEditHome = () => {
    const [content, setContent] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contentRes, productsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/content/home'),
                    axios.get('http://localhost:5000/api/products')
                ]);

                setProducts(productsRes.data.products || []);
                
                const fetched = contentRes.data;
                const merged = {
                    ...DEFAULT_HOME_DATA,
                    ...fetched,
                    signature: { ...DEFAULT_HOME_DATA.signature, ...fetched.signature },
                    lifestyle: { ...DEFAULT_HOME_DATA.lifestyle, ...fetched.lifestyle },
                    newArrivals: { ...DEFAULT_HOME_DATA.newArrivals, ...fetched.newArrivals },
                    trending: { ...DEFAULT_HOME_DATA.trending, ...fetched.trending },
                    editorial1: { ...DEFAULT_HOME_DATA.editorial1, ...fetched.editorial1 },
                    craft: { ...DEFAULT_HOME_DATA.craft, ...fetched.craft },
                    flagship: { ...DEFAULT_HOME_DATA.flagship, ...fetched.flagship },
                    editorial2: { ...DEFAULT_HOME_DATA.editorial2, ...fetched.editorial2 },
                    newsletter: { ...DEFAULT_HOME_DATA.newsletter, ...fetched.newsletter },
                    footer: { ...DEFAULT_HOME_DATA.footer, ...fetched.footer },
                    carousel: fetched.carousel && fetched.carousel.length > 0 ? fetched.carousel : DEFAULT_HOME_DATA.carousel || []
                };
                
                if (fetched.metadata) {
                    Object.assign(merged, fetched.metadata);
                }

                setContent(merged);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setContent(DEFAULT_HOME_DATA);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (path, value) => {
        const newContent = { ...content };
        const keys = path.split('.');
        let current = newContent;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setContent(newContent);
        setIsDirty(true);
    };

    const handleAddSlide = () => {
        const newSlide = {
            image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80',
            title: 'New Collection',
            subtitle: 'Enter description here.',
            buttonText: 'Shop Now',
            link: '/products',
            isActive: true,
            titleColor: 'white',
            subtitleColor: 'white'
        };
        const newCarousel = [...(content.carousel || []), newSlide];
        handleChange('carousel', newCarousel);
    };

    const handleRemoveSlide = (index) => {
        if (window.confirm('Remove this slide?')) {
            const newCarousel = content.carousel.filter((_, i) => i !== index);
            handleChange('carousel', newCarousel);
        }
    };

    const handleAddTicker = () => {
        const newTicker = [...(content.ticker || []), 'New Running Text Item'];
        handleChange('ticker', newTicker);
    };

    const handleRemoveTicker = (idx) => {
        const newTicker = content.ticker.filter((_, i) => i !== idx);
        handleChange('ticker', newTicker);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const { 
                ticker, hero, sections, values, cta, carousel, 
                signature, lifestyle, newArrivals, trending, 
                editorial1, craft, flagship, editorial2, 
                statsBand, newsletter, footer, ...rest 
            } = content;
            
            await axios.post('http://localhost:5000/api/content', {
                pageName: 'home',
                ticker, hero, sections, values, cta, carousel,
                signature, lifestyle, newArrivals, trending,
                editorial1, craft, flagship, editorial2,
                statsBand, newsletter, footer,
                metadata: rest
            }, {
                headers: { 'x-auth-token': token }
            });

            alert('✨ Home page globally updated!');
            setIsDirty(false);
        } catch (err) {
            alert('Failed to save: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="live-edit-loading">Initializing Live Canvas...</div>;

    const trendingProducts = products.filter(p => !p.isNewArrival).slice(0, 8);
    const newArrivalsProducts = products.filter(p => p.isNewArrival).slice(0, 8);

    return (
        <div className="premium-admin-canvas">
            <AdminSidebar />
            
            <main className="admin-viewport live-edit-viewport">
                {/* Save Bar */}
                <div className={`live-edit-bar ${isDirty ? 'visible' : ''}`}>
                    <div className="bar-info">
                        <span className="pulse-dot"></span>
                        {isDirty ? 'Unsaved Design Changes' : 'Design Synchronized'}
                    </div>
                    <div className="bar-actions">
                        <button className="cancel-btn" onClick={() => window.location.reload()}>Discard</button>
                        <button className="save-btn" disabled={saving || !isDirty} onClick={handleSave}>
                            {saving ? 'Publishing...' : 'Apply Globally'}
                        </button>
                    </div>
                </div>

                <div className="live-edit-container" style={{ paddingTop: '80px' }}>
                    <Navbar />

                    {/* ── CAROUSEL MANAGER ── */}
                    <div className="carousel-manager-board">
                        <div className="manager-header">
                            <div className="manager-title">
                                <h2>Hero Carousel Manager</h2>
                                <p style={{ color: '#888' }}>Manage your main homepage slides, images, and text colors.</p>
                            </div>
                            <button className="add-slide-btn" onClick={handleAddSlide}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add New Slide
                            </button>
                        </div>

                        <div className="slides-grid-editor">
                            {content.carousel.map((slide, idx) => (
                                <div key={idx} className="slide-edit-card">
                                    <div className="slide-card-header">
                                        <span>Slide {idx + 1}</span>
                                        <span className="remove-slide-link" onClick={() => handleRemoveSlide(idx)}>Remove</span>
                                    </div>
                                    <div className="slide-card-body">
                                        <EditableImage 
                                            src={slide.image?.url || slide.image} 
                                            onChange={(v) => {
                                                const newC = [...content.carousel];
                                                newC[idx].image = v;
                                                handleChange('carousel', newC);
                                            }}
                                            isEditMode={true}
                                            className="slide-img-preview"
                                        />
                                        <div className="slide-fields">
                                            <div>
                                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 700 }}>Headline</label>
                                                <EditableText 
                                                    content={slide.title} 
                                                    onChange={(v) => {
                                                        const newC = [...content.carousel];
                                                        newC[idx].title = v;
                                                        handleChange('carousel', newC);
                                                    }}
                                                    isEditMode={true}
                                                    style={{ fontSize: '1.2rem', fontWeight: 600, display: 'block', padding: '5px 0' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 700 }}>Subtext</label>
                                                <EditableText 
                                                    content={slide.subtitle} 
                                                    onChange={(v) => {
                                                        const newC = [...content.carousel];
                                                        newC[idx].subtitle = v;
                                                        handleChange('carousel', newC);
                                                    }}
                                                    isEditMode={true}
                                                    style={{ fontSize: '0.9rem', color: '#666', display: 'block' }}
                                                />
                                            </div>
                                            <div className="color-picker-row">
                                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 700 }}>Headline Color:</label>
                                                <div className="swatches">
                                                    {['white', 'gold', 'black'].map(col => (
                                                        <div 
                                                            key={col} 
                                                            className={`swatch swatch-${col} ${slide.titleColor === col ? 'active' : ''}`}
                                                            onClick={() => {
                                                                const newC = [...content.carousel];
                                                                newC[idx].titleColor = col;
                                                                handleChange('carousel', newC);
                                                            }}
                                                            title={col.charAt(0).toUpperCase() + col.slice(1)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="color-picker-row">
                                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 700 }}>Subtext Color:</label>
                                                <div className="swatches">
                                                    {['white', 'gold', 'black'].map(col => (
                                                        <div 
                                                            key={col} 
                                                            className={`swatch swatch-${col} ${slide.subtitleColor === col ? 'active' : ''}`}
                                                            onClick={() => {
                                                                const newC = [...content.carousel];
                                                                newC[idx].subtitleColor = col;
                                                                handleChange('carousel', newC);
                                                            }}
                                                            title={col.charAt(0).toUpperCase() + col.slice(1)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── TICKER MANAGER ── */}
                    <div className="ticker-manager-board">
                        <h2>Running Ticker Management</h2>
                        <div className="ticker-inputs-grid">
                            {(content.ticker || []).map((item, idx) => (
                                <div key={idx} className="ticker-input-pill">
                                    <input 
                                        type="text" 
                                        value={item} 
                                        onChange={(e) => {
                                            const newTicker = [...content.ticker];
                                            newTicker[idx] = e.target.value;
                                            handleChange('ticker', newTicker);
                                        }}
                                    />
                                    <span className="remove-pill" onClick={() => handleRemoveTicker(idx)}>×</span>
                                </div>
                            ))}
                            <button className="add-ticker-btn" onClick={handleAddTicker}>+ Add Item</button>
                        </div>
                    </div>

                    {/* HERO CAROUSEL PREVIEW */}
                    <div style={{ pointerEvents: 'none', borderBottom: '1px solid #eee' }}>
                         <HeroCarousel slides={content.carousel} />
                    </div>

                    {/* ── TICKER ── */}
                    <div className="ticker-bar">
                        <div className="ticker-track">
                            {(content.ticker || []).map((item, i) => (
                                <span key={i} className="ticker-item">
                                    {item}
                                    <span className="ticker-dot" />
                                </span>
                            ))}
                            {(content.ticker || []).map((item, i) => (
                                <span key={`clone-${i}`} className="ticker-item">
                                    {item}
                                    <span className="ticker-dot" />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── SIGNATURE HIGHLIGHT ── */}
                    <section className="signature-highlight">
                        <div className="signature-content">
                            <EditableText 
                                tag="p" className="signature-pre" 
                                content={content.signature.pre} 
                                onChange={(v) => handleChange('signature.pre', v)}
                                isEditMode={true}
                            />
                            <h2 className="signature-title">
                                <EditableText 
                                    tag="span"
                                    content={content.signature.title.split('\n')[0]} 
                                    onChange={(v) => handleChange('signature.title', v + '\n' + (content.signature.title.split('\n')[1] || ''))}
                                    isEditMode={true}
                                />
                                <br />
                                <em>
                                    <EditableText 
                                        tag="span"
                                        content={content.signature.title.split('\n')[1] || 'Elegance'} 
                                        onChange={(v) => handleChange('signature.title', (content.signature.title.split('\n')[0] || '') + '\n' + v)}
                                        isEditMode={true}
                                    />
                                </em>
                            </h2>
                            <EditableText 
                                tag="p" className="signature-desc" 
                                content={content.signature.desc} 
                                onChange={(v) => handleChange('signature.desc', v)}
                                isEditMode={true}
                            />
                            <div className="signature-link">
                                <EditableText 
                                    content={content.signature.linkText} 
                                    onChange={(v) => handleChange('signature.linkText', v)}
                                    isEditMode={true}
                                />
                            </div>
                        </div>
                        <div className="signature-visual">
                            <EditableImage 
                                src={content.signature.image} 
                                onChange={(v) => handleChange('signature.image', v)}
                                isEditMode={true}
                                alt="Signature"
                            />
                        </div>
                    </section>

                    {/* ── LIFESTYLE SHOWCASE ── */}
                    <section className="lifestyle-showcase">
                        <div className="lifestyle-grid">
                            <div className="lifestyle-item main">
                                <EditableImage 
                                    src={content.lifestyle.main.image} 
                                    onChange={(v) => handleChange('lifestyle.main.image', v)}
                                    isEditMode={true}
                                />
                                <div className="lifestyle-overlay">
                                     <EditableText 
                                        tag="p" className="lifestyle-lbl" 
                                        content={content.lifestyle.main.label} 
                                        onChange={(v) => handleChange('lifestyle.main.label', v)}
                                        isEditMode={true}
                                     />
                                     <h2>
                                        <EditableText 
                                            content={content.lifestyle.main.title} 
                                            onChange={(v) => handleChange('lifestyle.main.title', v)}
                                            isEditMode={true}
                                        />
                                     </h2>
                                     <div className="lifestyle-btn">
                                        <EditableText 
                                            content={content.lifestyle.main.btnText} 
                                            onChange={(v) => handleChange('lifestyle.main.btnText', v)}
                                            isEditMode={true}
                                        />
                                     </div>
                                </div>
                            </div>
                            <div className="lifestyle-side">
                                 <div className="lifestyle-item small">
                                     <EditableImage 
                                        src={content.lifestyle.side1.image} 
                                        onChange={(v) => handleChange('lifestyle.side1.image', v)}
                                        isEditMode={true}
                                     />
                                     <div className="lifestyle-overlay">
                                         <h3>
                                            <EditableText 
                                                content={content.lifestyle.side1.title} 
                                                onChange={(v) => handleChange('lifestyle.side1.title', v)}
                                                isEditMode={true}
                                            />
                                         </h3>
                                     </div>
                                 </div>
                                 <div className="lifestyle-item small">
                                     <EditableImage 
                                        src={content.lifestyle.side2.image} 
                                        onChange={(v) => handleChange('lifestyle.side2.image', v)}
                                        isEditMode={true}
                                     />
                                     <div className="lifestyle-overlay">
                                         <h3>
                                            <EditableText 
                                                content={content.lifestyle.side2.title} 
                                                onChange={(v) => handleChange('lifestyle.side2.title', v)}
                                                isEditMode={true}
                                            />
                                         </h3>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </section>

                    <div style={{ pointerEvents: 'none', opacity: 0.8 }}>
                        <ProductQueue
                            title={<EditableText content={content.newArrivals.title} isEditMode={false} />}
                            subtitle={<EditableText content={content.newArrivals.subtitle} isEditMode={false} />}
                            products={newArrivalsProducts}
                        />
                    </div>

                    <section className="editorial-banner">
                        <EditableImage 
                            src={content.editorial1.image} 
                            onChange={(v) => handleChange('editorial1.image', v)}
                            isEditMode={true}
                        />
                        <div className="editorial-overlay" />
                        <div className="editorial-content">
                            <EditableText 
                                tag="p" className="eyebrow" 
                                content={content.editorial1.eyebrow} 
                                onChange={(v) => handleChange('editorial1.eyebrow', v)}
                                isEditMode={true}
                            />
                            <h2>
                                <EditableText 
                                    content={content.editorial1.title} 
                                    onChange={(v) => handleChange('editorial1.title', v)}
                                    isEditMode={true}
                                />
                            </h2>
                            <EditableText 
                                tag="p" 
                                content={content.editorial1.desc} 
                                onChange={(v) => handleChange('editorial1.desc', v)}
                                isEditMode={true}
                            />
                            <div className="btn-gold">
                                <EditableText 
                                    content={content.editorial1.linkText} 
                                    onChange={(v) => handleChange('editorial1.linkText', v)}
                                    isEditMode={true}
                                />
                            </div>
                        </div>
                    </section>

                    <div style={{ pointerEvents: 'none', opacity: 0.8 }}>
                        <ProductQueue
                            title={<EditableText content={content.trending.title} isEditMode={false} />}
                            subtitle={<EditableText content={content.trending.subtitle} isEditMode={false} />}
                            products={trendingProducts}
                        />
                    </div>

                    <section className="craft-section">
                        <div style={{ textAlign: 'center' }}>
                            <EditableText 
                                tag="p" 
                                style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: '14px' }}
                                content={content.craft.pre} 
                                onChange={(v) => handleChange('craft.pre', v)}
                                isEditMode={true}
                            />
                            <h2>
                                <EditableText 
                                    style={{ fontSize: 'clamp(2rem,4vw,3.5rem)' }}
                                    content={content.craft.title} 
                                    onChange={(v) => handleChange('craft.title', v)}
                                    isEditMode={true}
                                />
                            </h2>
                        </div>
                        <div className="craft-grid">
                            {(content.craft.features || []).map((f, i) => (
                                <div key={i} className="craft-card">
                                    <h3>
                                        <EditableText 
                                            content={f.title} 
                                            onChange={(v) => {
                                                const newFeat = [...content.craft.features];
                                                newFeat[i].title = v;
                                                handleChange('craft.features', newFeat);
                                            }}
                                            isEditMode={true}
                                        />
                                    </h3>
                                    <EditableText 
                                        tag="p"
                                        content={f.desc} 
                                        onChange={(v) => {
                                            const newFeat = [...content.craft.features];
                                            newFeat[i].desc = v;
                                            handleChange('craft.features', newFeat);
                                        }}
                                        isEditMode={true}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="split-section">
                        <div className="split-image">
                            <EditableImage 
                                src={content.flagship.image} 
                                onChange={(v) => handleChange('flagship.image', v)}
                                isEditMode={true}
                            />
                        </div>
                        <div className="split-content">
                            <div className="split-inner">
                                <EditableText 
                                    tag="p" className="eyebrow"
                                    content={content.flagship.eyebrow} 
                                    onChange={(v) => handleChange('flagship.eyebrow', v)}
                                    isEditMode={true}
                                />
                                <h2>
                                    <EditableText 
                                        content={content.flagship.title} 
                                        onChange={(v) => handleChange('flagship.title', v)}
                                        isEditMode={true}
                                    />
                                </h2>
                                <EditableText 
                                    tag="p"
                                    content={content.flagship.desc} 
                                    onChange={(v) => handleChange('flagship.desc', v)}
                                    isEditMode={true}
                                />
                                <div className="split-stats">
                                    {(content.flagship.stats || []).map((s, i) => (
                                        <div key={i} className="split-stat">
                                            <span className="num">
                                                <EditableText 
                                                    content={s.num} 
                                                    onChange={(v) => {
                                                        const newStats = [...content.flagship.stats];
                                                        newStats[i].num = v;
                                                        handleChange('flagship.stats', newStats);
                                                    }}
                                                    isEditMode={true}
                                                />
                                            </span>
                                            <span className="lbl">
                                                <EditableText 
                                                    content={s.label} 
                                                    onChange={(v) => {
                                                        const newStats = [...content.flagship.stats];
                                                        newStats[i].label = v;
                                                        handleChange('flagship.stats', newStats);
                                                    }}
                                                    isEditMode={true}
                                                />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="btn-gold">
                                    <EditableText 
                                        content={content.flagship.btnText} 
                                        onChange={(v) => handleChange('flagship.btnText', v)}
                                        isEditMode={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="stats-band">
                        {(content.statsBand || []).map((s, i) => (
                            <div key={i} className="stat-block">
                                <span className="stat-num">
                                    <EditableText 
                                        content={s.num} 
                                        onChange={(v) => {
                                            const newStats = [...content.statsBand];
                                            newStats[i].num = v;
                                            handleChange('statsBand', newStats);
                                        }}
                                        isEditMode={true}
                                    />
                                </span>
                                <p className="stat-label">
                                    <EditableText 
                                        content={s.label} 
                                        onChange={(v) => {
                                            const newStats = [...content.statsBand];
                                            newStats[i].label = v;
                                            handleChange('statsBand', newStats);
                                        }}
                                        isEditMode={true}
                                    />
                                </p>
                            </div>
                        ))}
                    </div>

                    <section className="newsletter-section">
                        <EditableText 
                            tag="p" className="eyebrow"
                            content={content.newsletter.eyebrow} 
                            onChange={(v) => handleChange('newsletter.eyebrow', v)}
                            isEditMode={true}
                        />
                        <h2>
                            <EditableText 
                                content={content.newsletter.title} 
                                onChange={(v) => handleChange('newsletter.title', v)}
                                isEditMode={true}
                            />
                        </h2>
                        <EditableText 
                            tag="p"
                            content={content.newsletter.desc} 
                            onChange={(v) => handleChange('newsletter.desc', v)}
                            isEditMode={true}
                        />
                    </section>

                    <footer className="footer">
                        <div className="footer-content">
                            <div className="footer-brand">
                                <h3>
                                    <EditableText 
                                        content={content.footer.brandName} 
                                        onChange={(v) => handleChange('footer.brandName', v)}
                                        isEditMode={true}
                                    />
                                </h3>
                                <EditableText 
                                    tag="p"
                                    content={content.footer.brandDesc} 
                                    onChange={(v) => handleChange('footer.brandDesc', v)}
                                    isEditMode={true}
                                />
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <EditableText 
                                tag="p"
                                content={content.footer.copyright} 
                                onChange={(v) => handleChange('footer.copyright', v)}
                                isEditMode={true}
                            />
                            <EditableText 
                                tag="p"
                                content={content.footer.bottomText} 
                                onChange={(v) => handleChange('footer.bottomText', v)}
                                isEditMode={true}
                            />
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default LiveEditHome;
