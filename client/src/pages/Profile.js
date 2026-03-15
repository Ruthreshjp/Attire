import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' }
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '', email: user.email || '', phone: user.phone || '',
                address: (user.address && typeof user.address === 'object') ? user.address : { street: '', city: '', state: '', zipCode: '', country: '' }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({ ...formData, [parent]: { ...formData[parent], [child]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) { 
                login({ user: data.user, token }); 
                setMessage('✓ Profile updated successfully!'); 
                setIsEditing(false); 
            } else {
                setMessage(data.message || 'Update failed');
            }
        } catch { 
            setMessage('Something went wrong. Please try again.'); 
        } finally { 
            setLoading(false); 
        }
    };

    if (!user) return (
        <div className="profile-page-vessel">
            <Navbar />
            <div className="login-prompt-vessel">
                <div className="prompt-content">
                    <div className="luxury-logo-sm">A</div>
                    <h2>Exclusive Access Required</h2>
                    <p>Please sign in to manage your premium ATTIRE profile and preferences.</p>
                    <Link to="/login" className="noir-btn">Sign In Now</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="profile-page-vessel">
            <Navbar />

            <div className="profile-hero-section">
                <div className="hero-content">
                    <span className="eyebrow">{user.role === 1 ? 'Administrator Hub' : 'Client Profile'}</span>
                    <h1>{user.name}</h1>
                    <div className="profile-status-bar">
                        <span className="status-item"><span className="dot gold"></span> {user.role === 1 ? 'Executive Authority' : 'Premium Member'}</span>
                        <span className="status-item"><span className="dot"></span> {user.role === 1 ? 'System Integrity: High' : 'Active Client Session'}</span>
                    </div>
                </div>
            </div>

            <div className="profile-dashboard-grid">
                {/* ── Sidebar Navigation ── */}
                <aside className="profile-vessel-sidebar">
                    <div className="sidebar-avatar-section">
                        <div className="avatar-vessel">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="avatar-meta">
                            <p className="u-name">{user.name}</p>
                            <p className="u-email">{user.email}</p>
                        </div>
                    </div>

                    <nav className="vessel-nav">
                        <Link to="/profile" className="vessel-link active">
                            <span className="v-icon">👤</span> Account Identity
                        </Link>
                    </nav>
                </aside>

                {/* ── Main Content ── */}
                <main className="profile-vessel-main">
                    <section className="form-card-vessel">
                        <div className="card-header-vessel">
                            <div className="header-text">
                                <h2>Identity Details</h2>
                                <p>Manage your personal credentials and contact information.</p>
                            </div>
                            {!isEditing && (
                                <button className="edit-btn-vessel" onClick={() => setIsEditing(true)}>Modify Details</button>
                            )}
                        </div>

                        {message && (
                            <div className={`notification-vessel ${message.includes('✓') ? 'success' : 'error'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="vessel-form">
                            <div className="form-row-vessel">
                                <div className="vessel-input-group">
                                    <label>Legal Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} placeholder="John Doe" />
                                </div>
                                <div className="vessel-input-group">
                                    <label>Email ID</label>
                                    <input type="email" value={formData.email} disabled className="readonly-input" />
                                </div>
                            </div>

                            <div className="form-row-vessel">
                                <div className="vessel-input-group">
                                    <label>Communication Line</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="+91 00000 00000" />
                                </div>
                                <div className="vessel-input-group blank"></div>
                            </div>

                            {user.role !== 1 && (
                                <>
                                    <div className="form-separator">
                                        <span>Shipping Logistics</span>
                                    </div>

                                    <div className="vessel-input-group full">
                                        <label>Street Address</label>
                                        <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} disabled={!isEditing} placeholder="House / Suite / Building" />
                                    </div>

                                    <div className="form-row-vessel trifecta">
                                        <div className="vessel-input-group">
                                            <label>City</label>
                                            <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} disabled={!isEditing} />
                                        </div>
                                        <div className="vessel-input-group">
                                            <label>State</label>
                                            <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} disabled={!isEditing} />
                                        </div>
                                        <div className="vessel-input-group">
                                            <label>Registry (ZIP)</label>
                                            <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} disabled={!isEditing} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {isEditing && (
                                <div className="vessel-form-actions">
                                    <button type="button" className="vessel-cancel" onClick={() => setIsEditing(false)}>Discard</button>
                                    <button type="submit" className="vessel-save" disabled={loading}>
                                        {loading ? 'Synchronizing…' : 'Save Attributes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Profile;
