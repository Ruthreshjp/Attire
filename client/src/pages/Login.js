import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [verificationCode, setVerificationCode] = useState('');
    const [isUnverified, setIsUnverified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) { 
                login({ token: data.token, user: data.user }); 
                navigate(from); 
            } else if (data.unverified) {
                setIsUnverified(true);
                setError('Your email is not verified. Please enter the code sent to your email.');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch { setError('Connection error. Please try again.'); }
        finally { setLoading(false); }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: verificationCode })
            });
            const data = await res.json();
            if (data.success) {
                login({ token: data.token, user: data.user });
                navigate(from);
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch { setError('Something went wrong. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* LEFT — Brand Panel */}
            <div style={{
                flex: '0 0 42%', background: '#000',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '40px 60px',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative circle */}
                <div style={{
                    position: 'absolute', bottom: '-15%', right: '-15%',
                    width: '500px', height: '500px', borderRadius: '50%',
                    border: '1px solid rgba(197,160,89,0.08)'
                }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '350px', height: '350px', borderRadius: '50%', border: '1px solid rgba(197,160,89,0.05)' }} />

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Attire" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: '#fff', letterSpacing: '6px', fontWeight: 700 }}>ATTIRE</span>
                </Link>

                {/* Main */}
                <div>
                    <p style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '15px' }}>Welcome Back</p>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,3.5vw,3.5rem)', color: '#fff', marginBottom: '15px', lineHeight: 1.05 }}>
                        Dressed to<br /><em style={{ color: '#c5a059' }}>Impress.</em>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '300px' }}>
                        Sign in to access your personalized wardrobe experience, track orders, and discover exclusive member-only collections.
                    </p>
                </div>

                {/* Bottom Stats */}
                <div style={{ display: 'flex', gap: '40px' }}>
                    {[['5K+', 'Members'], ['200+', 'Styles'], ['100%', 'Premium']].map(([n, l]) => (
                        <div key={l}>
                            <span style={{ display: 'block', fontFamily: "'Playfair Display',serif", fontSize: '1.6rem', color: '#c5a059', fontWeight: 700 }}>{n}</span>
                            <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{l}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT — Form Panel */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 8%', background: '#fff' }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', marginBottom: '8px' }}>Sign In</h2>
                    <p style={{ color: '#999', marginBottom: '48px', fontSize: '0.9rem' }}>
                        New here? <Link to="/signup" style={{ color: '#c5a059', fontWeight: 700 }}>Create an account</Link>
                    </p>

                    {error && (
                        <div style={{ padding: '14px 18px', background: '#fff5f5', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '28px' }}>
                            {error}
                        </div>
                    )}

                    {!isUnverified ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="form-field">
                                <label>Email Address</label>
                                <input
                                    type="email" required
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-field">
                                <label>Password</label>
                                <input
                                    type="password" required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '18px', background: loading ? '#888' : '#000',
                                    color: '#c5a059', fontSize: '0.75rem', fontWeight: 800,
                                    letterSpacing: '3px', textTransform: 'uppercase', border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
                                    transition: 'background 0.3s',
                                }}
                            >
                                {loading ? 'Signing In…' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="form-field">
                                <label>Verification Code</label>
                                <input
                                    type="text" required
                                    placeholder="123456"
                                    value={verificationCode}
                                    onChange={e => setVerificationCode(e.target.value)}
                                    style={{
                                        letterSpacing: '10px',
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 700
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '18px', background: loading ? '#888' : '#000',
                                    color: '#c5a059', fontSize: '0.75rem', fontWeight: 800,
                                    letterSpacing: '3px', textTransform: 'uppercase', border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
                                    transition: 'background 0.3s',
                                }}
                            >
                                {loading ? 'Verifying…' : 'Verify and Login'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsUnverified(false)}
                                style={{
                                    background: 'none', border: 'none', color: '#666', 
                                    textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem'
                                }}
                            >Back to Login</button>
                        </form>
                    )}

                    <p style={{ marginTop: '36px', color: '#aaa', fontSize: '0.8rem', textAlign: 'center' }}>
                        By signing in you agree to our{' '}
                        <a href="#" style={{ color: '#000', textDecoration: 'underline' }}>Terms of Service</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
