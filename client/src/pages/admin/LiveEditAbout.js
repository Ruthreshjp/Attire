import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import { useNotification } from '../../context/NotificationContext';
import { EditableText, EditableImage } from '../../components/Editable';
import { DEFAULT_ABOUT_DATA } from '../../utils/defaultContent';
import { Link } from 'react-router-dom';
import './LiveEdit.css';

const LiveEditAbout = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const { showAlert, showConfirm } = useNotification();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/about`);
                const fetched = res.data;
                const merged = {
                    ...DEFAULT_ABOUT_DATA,
                    ...fetched,
                    hero: { ...DEFAULT_ABOUT_DATA.hero, ...fetched.hero },
                    promise: { ...DEFAULT_ABOUT_DATA.promise, ...fetched.promise },
                    cta: { ...DEFAULT_ABOUT_DATA.cta, ...fetched.cta }
                };
                if (fetched.metadata) Object.assign(merged, fetched.metadata);
                setContent(merged);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setContent(DEFAULT_ABOUT_DATA);
                setLoading(false);
            }
        };
        fetchContent();
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const { hero, sections, values, cta, promise, ...rest } = content;
            await axios.post(`${process.env.REACT_APP_API_URL}/api/content`, {
                pageName: 'about',
                hero, sections, values, cta, promise,
                metadata: rest
            }, { headers: { 'x-auth-token': token } });
            showAlert('✨ About page globally updated!');
            setIsDirty(false);
        } catch (err) {
            showAlert('Failed to save: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleAddSection = () => {
        const newSection = {
            title: 'New Chapter',
            content: 'Write your story here.',
            image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&q=80'
        };
        handleChange('sections', [...content.sections, newSection]);
    };

    const handleRemoveSection = (idx) => {
        showConfirm('Are you sure you want to delete this chapter?', () => {
            handleChange('sections', content.sections.filter((_, i) => i !== idx));
        });
    };

    if (loading) return <div className="live-edit-loading">Initializing About Canvas...</div>;

    return (
        <div className="premium-admin-canvas">
            <AdminSidebar />
            <main className="admin-viewport live-edit-viewport">
                {/* Save Bar */}
                <div className={`live-edit-bar ${isDirty ? 'visible' : ''}`}>
                    <div className="bar-info"><span className="pulse-dot"></span>{isDirty ? 'Unsaved Design Changes' : 'Design Synchronized'}</div>
                    <div className="bar-actions">
                        <button className="cancel-btn" onClick={() => window.location.reload()}>Discard</button>
                        <button className="save-btn" disabled={saving || !isDirty} onClick={handleSave}>
                            {saving ? 'Publishing...' : 'Apply Globally'}
                        </button>
                    </div>
                </div>

                <div className="live-edit-container" style={{ paddingTop: '80px' }}>
                    <Navbar />

                    {/* ── SECTION MANAGER ── */}
                    <div className="carousel-manager-board" style={{ background: '#fff' }}>
                         <div className="manager-header">
                            <div className="manager-title">
                                <h2>Page Assets Manager</h2>
                                <p style={{ color: '#888' }}>Quickly swap the main banners and story images.</p>
                            </div>
                            <button className="add-slide-btn" onClick={handleAddSection}>Add New Chapter</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {/* Hero Image */}
                            <div className="slide-edit-card" style={{ padding: '15px' }}>
                                <div style={{ marginBottom: '10px', fontSize: '0.7rem', color: '#c5a059', fontWeight: 700, textTransform: 'uppercase' }}>Main Hero Banner</div>
                                <EditableImage src={content.hero.image} onChange={(v) => handleChange('hero.image', v)} isEditMode={true} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                            </div>

                            {/* Promise Image */}
                            <div className="slide-edit-card" style={{ padding: '15px' }}>
                                <div style={{ marginBottom: '10px', fontSize: '0.7rem', color: '#c5a059', fontWeight: 700, textTransform: 'uppercase' }}>Promise Section Image</div>
                                <EditableImage src={content.promise.image} onChange={(v) => handleChange('promise.image', v)} isEditMode={true} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                            </div>

                            {content.sections.map((s, i) => (
                                <div key={i} className="slide-edit-card" style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.7rem', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>
                                        <span>Chapter {i + 1} Image</span>
                                        <span style={{ color: '#ff4444', cursor: 'pointer' }} onClick={() => handleRemoveSection(i)}>Delete</span>
                                    </div>
                                    <EditableImage src={s.image} onChange={(v) => { const ns = [...content.sections]; ns[i].image = v; handleChange('sections', ns); }} isEditMode={true} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── HERO SECTION ── */}
                    <div className="about-hero-edit-wrapper" style={{ 
                        position: 'relative', 
                        height: '80vh', 
                        minHeight: '600px',
                        overflow: 'hidden',
                        background: '#1a1a1a' // Fallback
                    }}>
                        {/* THE BACKGROUND IMAGE EDITOR */}
                        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                            <EditableImage
                                src={content.hero.image}
                                onChange={(v) => handleChange('hero.image', v)}
                                isEditMode={true}
                                style={{ width: '100%', height: '100%' }}
                                className="about-hero-bg"
                            />
                        </div>

                        {/* THE GRADIENT OVERLAY (Non-blocking) */}
                        <div style={{ 
                            position: 'absolute', inset: 0, 
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
                            zIndex: 2,
                            pointerEvents: 'none'
                        }} />

                        {/* THE TEXT CONTENT */}
                        <div style={{ 
                            position: 'relative', 
                            zIndex: 3, 
                            height: '100%',
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            textAlign: 'center', 
                            padding: '0 10%',
                            pointerEvents: 'none' // Clicks fall through to the image
                        }}>
                             <div style={{ pointerEvents: 'auto' }}>
                                <p style={{ fontSize: '0.7rem', letterSpacing: '6px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '20px' }}>Our Identity</p>
                                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(3rem,6vw,6rem)', color: '#fff', lineHeight: 1.05, marginBottom: '20px' }}>
                                    <EditableText content={content.hero.title} onChange={(v) => handleChange('hero.title', v)} isEditMode={true} />
                                </h1>
                                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                                    <EditableText content={content.hero.subtitle} onChange={(v) => handleChange('hero.subtitle', v)} isEditMode={true} />
                                </p>
                             </div>
                        </div>
                    </div>

                    {/* ── STORY SECTIONS ── */}
                    {(content.sections || []).map((section, index) => (
                        <section key={index} style={{
                            padding: '120px 8%',
                            background: index % 2 === 0 ? '#fff' : '#f9f7f4'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                                <div style={{ overflow: 'hidden', position: 'relative', order: index % 2 === 0 ? 0 : 1 }}>
                                    <EditableImage
                                        src={section.image}
                                        onChange={(v) => { const ns = [...content.sections]; ns[index].image = v; handleChange('sections', ns); }}
                                        isEditMode={true}
                                        style={{ width: '100%', height: '560px', objectFit: 'cover', display: 'block' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', background: '#c5a059', zIndex: -1 }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '16px' }}>Chapter {index + 1}</p>
                                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,3.5vw,3rem)', marginBottom: '30px', lineHeight: 1.1 }}>
                                        <EditableText content={section.title} onChange={(v) => { const ns = [...content.sections]; ns[index].title = v; handleChange('sections', ns); }} isEditMode={true} />
                                    </h2>
                                    <div style={{ width: '50px', height: '1px', background: '#c5a059', marginBottom: '28px' }} />
                                    <EditableText 
                                        tag="p"
                                        content={section.content} 
                                        onChange={(v) => { const ns = [...content.sections]; ns[index].content = v; handleChange('sections', ns); }} 
                                        isEditMode={true}
                                        style={{ color: '#666', fontSize: '1rem', lineHeight: 1.9 }}
                                    />
                                </div>
                            </div>
                        </section>
                    ))}

                    {/* ── VALUES ── */}
                    <section style={{ padding: '120px 8%', background: '#000' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <p style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '16px' }}>What We Stand For</p>
                            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,4vw,4rem)', color: '#fff' }}>Our Core Values</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2px', maxWidth: '1200px', margin: '0 auto' }}>
                            {(content.values || []).map((value, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '50px 40px',
                                        background: '#111', border: '1px solid #1e1e1e',
                                        cursor: 'default'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '24px' }}><EditableText content={value.icon} onChange={(v) => { const nv = [...content.values]; nv[index].icon = v; handleChange('values', nv); }} isEditMode={true} /></div>
                                    <h3 style={{ color: '#fff', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', marginBottom: '14px' }}>
                                        <EditableText content={value.title} onChange={(v) => { const nv = [...content.values]; nv[index].title = v; handleChange('values', nv); }} isEditMode={true} />
                                    </h3>
                                    <EditableText 
                                        tag="p"
                                        content={value.description} 
                                        onChange={(v) => { const nv = [...content.values]; nv[index].description = v; handleChange('values', nv); }} 
                                        isEditMode={true}
                                        style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', lineHeight: 1.8 }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── PROMISE / PHILOSOPHY STRIP ── */}
                    <section style={{ padding: '120px 8%', background: '#f9f7f4' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '16px' }}>The Promise</p>
                                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,3.5vw,3rem)', marginBottom: '28px', lineHeight: 1.1 }}>
                                    <EditableText content={content.promise.title} onChange={(v) => handleChange('promise.title', v)} isEditMode={true} />
                                </h2>
                                <div style={{ width: '50px', height: '1px', background: '#c5a059', marginBottom: '28px' }} />
                                <EditableText 
                                    tag="p"
                                    content={content.promise.desc1} 
                                    onChange={(v) => handleChange('promise.desc1', v)} 
                                    isEditMode={true}
                                    style={{ color: '#666', fontSize: '1rem', lineHeight: 1.9, marginBottom: '24px' }}
                                />
                                <EditableText tag="p"
                                    content={content.promise.desc2} 
                                    onChange={(v) => handleChange('promise.desc2', v)} 
                                    isEditMode={true}
                                    style={{ color: '#666', fontSize: '1rem', lineHeight: 1.9, marginBottom: '40px' }}
                                />
                                <div style={{ display: 'flex', gap: '40px' }}>
                                    {(content.promise.stats || []).map((s, i) => (
                                        <div key={i}>
                                            <span style={{ display: 'block', fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', fontWeight: 700, color: '#000' }}>
                                                <EditableText content={s.n} onChange={(v) => { const ns = [...content.promise.stats]; ns[i].n = v; handleChange('promise.stats', ns); }} isEditMode={true} />
                                            </span>
                                            <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa' }}>
                                                 <EditableText content={s.l} onChange={(v) => { const ns = [...content.promise.stats]; ns[i].l = v; handleChange('promise.stats', ns); }} isEditMode={true} />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ overflow: 'hidden', position: 'relative' }}>
                                <EditableImage
                                    src={content.promise.image}
                                    onChange={(v) => handleChange('promise.image', v)}
                                    isEditMode={true}
                                    style={{ width: '100%', height: '520px', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', background: '#000', zIndex: -1 }} />
                            </div>
                        </div>
                    </section>

                    {/* ── CTA ── */}
                    <section style={{
                        padding: '120px 8%', background: '#000', textAlign: 'center',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%,-50%)',
                            fontFamily: "'Playfair Display',serif", fontSize: '20vw',
                            color: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap', pointerEvents: 'none'
                        }}>ATTIRE</div>
                        <p style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '20px' }}>Ready to Begin?</p>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,4vw,4rem)', color: '#fff', marginBottom: '20px' }}>
                            <EditableText content={content.cta.title} onChange={(v) => handleChange('cta.title', v)} isEditMode={true} />
                        </h2>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', marginBottom: '50px', maxWidth: '560px', margin: '0 auto 50px' }}>
                            <EditableText content={content.cta.description} onChange={(v) => handleChange('cta.description', v)} isEditMode={true} />
                        </div>
                        <Link to="/products" className="btn-gold" style={{ display: 'inline-flex' }}>
                            Explore Collection
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LiveEditAbout;
