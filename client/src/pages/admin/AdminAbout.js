import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

const AdminAbout = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [content, setContent] = useState({
        pageName: 'about',
        hero: { title: '', subtitle: '', image: '' },
        sections: [{ title: '', content: '', image: '' }],
        values: [
            { icon: '💎', title: '', description: '' },
            { icon: '🎨', title: '', description: '' },
            { icon: '🤝', title: '', description: '' }
        ],
        cta: { title: '', description: '' }
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/content/about');
            const data = await response.json();
            if (response.ok) {
                setContent(data);
            }
        } catch (err) {
            console.error('Error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setContent({
            ...content,
            hero: { ...content.hero, [name]: value }
        });
    };

    const handleSectionChange = (index, e) => {
        const { name, value } = e.target;
        const newSections = [...content.sections];
        newSections[index][name] = value;
        setContent({ ...content, sections: newSections });
    };

    const handleValueChange = (index, e) => {
        const { name, value } = e.target;
        const newValues = [...content.values];
        newValues[index][name] = value;
        setContent({ ...content, values: newValues });
    };

    const handleCtaChange = (e) => {
        const { name, value } = e.target;
        setContent({
            ...content,
            cta: { ...content.cta, [name]: value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(content)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Content updated successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update content.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Something went wrong.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading content...</div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-info">
                        <h1>Manage About Page</h1>
                        <p>Customize the content and imagery for the About Us section</p>
                    </div>
                </header>

                <div className="admin-content-card">
                    {message.text && (
                        <div className={`admin-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="admin-form">
                        {/* Hero Section */}
                        <section className="form-section">
                            <h3>Hero Section</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Hero Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={content.hero.title}
                                        onChange={handleHeroChange}
                                        placeholder="Main headline"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Hero Subtitle</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={content.hero.subtitle}
                                        onChange={handleHeroChange}
                                        placeholder="Supporting text"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Hero Background Image URL</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={content.hero.image}
                                        onChange={handleHeroChange}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Story Section */}
                        {content.sections.map((section, index) => (
                            <section key={index} className="form-section">
                                <h3>Our Story Section</h3>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={section.title}
                                            onChange={(e) => handleSectionChange(index, e)}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Story Content</label>
                                        <textarea
                                            name="content"
                                            value={section.content}
                                            onChange={(e) => handleSectionChange(index, e)}
                                            rows="5"
                                        ></textarea>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Story Image URL</label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={section.image}
                                            onChange={(e) => handleSectionChange(index, e)}
                                        />
                                    </div>
                                </div>
                            </section>
                        ))}

                        {/* Values Section */}
                        <section className="form-section">
                            <h3>Our Values</h3>
                            <div className="values-edit-grid">
                                {content.values.map((val, index) => (
                                    <div key={index} className="value-edit-card">
                                        <div className="form-group">
                                            <label>Icon</label>
                                            <input
                                                type="text"
                                                name="icon"
                                                value={val.icon}
                                                onChange={(e) => handleValueChange(index, e)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={val.title}
                                                onChange={(e) => handleValueChange(index, e)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={val.description}
                                                onChange={(e) => handleValueChange(index, e)}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="form-section">
                            <h3>CTA Section</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>CTA Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={content.cta.title}
                                        onChange={handleCtaChange}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>CTA Description</label>
                                    <textarea
                                        name="description"
                                        value={content.cta.description}
                                        onChange={handleCtaChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        <div className="form-actions sticky-actions">
                            <button type="submit" className="save-btn" disabled={saving}>
                                {saving ? 'Saving...' : 'Update About Page'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <style>{`
                .admin-content-card {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }
                .form-section {
                    margin-bottom: 40px;
                    padding-bottom: 30px;
                    border-bottom: 1px solid #eee;
                }
                .form-section h3 {
                    font-size: 1.2rem;
                    color: #1a1a1a;
                    margin-bottom: 20px;
                }
                .values-edit-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                .value-edit-card {
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #eee;
                }
                .sticky-actions {
                    position: sticky;
                    bottom: 0;
                    background: white;
                    padding: 20px 0;
                    margin-top: 20px;
                    border-top: 1px solid #eee;
                    z-index: 10;
                }
                .admin-message {
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .admin-message.success { background: #e8f5e9; color: #2e7d32; }
                .admin-message.error { background: #ffebee; color: #c62828; }
            `}</style>
        </div>
    );
};

export default AdminAbout;
