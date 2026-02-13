import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                login(data);
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Navbar />
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Join us today to get started.</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={onSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={onChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                                placeholder="Min 6 characters"
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                required
                                placeholder="Repeat your password"
                                minLength="6"
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
