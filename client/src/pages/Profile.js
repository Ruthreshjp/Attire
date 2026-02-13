import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                login({ user: data.user, token }); // Update context but keep token
                setMessage('Profile updated successfully!');
                setIsEditing(false);
            } else {
                setMessage(data.message || 'Update failed');
            }
        } catch (err) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="loading">Please login to view profile.</div>;

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1>{user.name}</h1>
                        <p>{user.role === 1 ? 'Administrator' : 'Valued Customer'}</p>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="profile-card">
                        <div className="card-header">
                            <h2>Personal Information</h2>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="edit-btn">Edit Profile</button>
                            )}
                        </div>

                        {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Add phone number"
                                    />
                                </div>
                            </div>

                            <h3 className="sub-title">Shipping Address</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Street Address</label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Street name and house number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State / Province</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ZIP / Postal Code</label>
                                    <input
                                        type="text"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                                    <button type="submit" className="save-btn" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
