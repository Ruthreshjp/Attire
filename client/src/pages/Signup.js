import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Signup = () => {
    const [step, setStep] = useState(1); // 1: Register, 2: Verify
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const { showAlert } = useNotification();
    const navigate = useNavigate();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmitRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
            });
            const data = await res.json();
            if (data.success) {
                setStep(2);
                showAlert('Verification code sent to your email!');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch { setError('Something went wrong. Please try again.'); }
        finally { setLoading(false); }
    };

    const onSubmitVerify = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: verificationCode })
            });
            const data = await res.json();
            if (data.success) {
                login({ token: data.token, user: data.user });
                navigate('/');
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
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(197,160,89,0.06)' }} />
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Attire" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: '#fff', letterSpacing: '6px', fontWeight: 700 }}>ATTIRE</span>
                </Link>
                <div>
                    <p style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '15px' }}>Join The Club</p>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,3.5vw,3.5rem)', color: '#fff', marginBottom: '15px', lineHeight: 1.05 }}>
                        {step === 1 ? 'Your Style,' : 'Secure Your'}<br /><em style={{ color: '#c5a059' }}>{step === 1 ? 'Elevated.' : 'Account.'}</em>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '300px' }}>
                        {step === 1 
                            ? 'Create your ATTIRE account and unlock exclusive drops, personalized recommendations, and seamless shopping.'
                            : 'We have sent a 6-digit verification code to your email. Please enter it to verify your account.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '30px' }}>
                    {[['Free', 'Membership'], ['Early', 'Access'], ['Premium', 'Benefits']].map(([n, l]) => (
                        <div key={l}>
                            <span style={{ display: 'block', fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', color: '#c5a059', fontWeight: 700 }}>{n}</span>
                            <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{l}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT — Form Panel */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 8%', background: '#fff' }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', marginBottom: '8px' }}>
                        {step === 1 ? 'Create Account' : 'Verify Email'}
                    </h2>
                    <p style={{ color: '#999', marginBottom: '40px', fontSize: '0.9rem' }}>
                        {step === 1 ? (
                            <>Already a member? <Link to="/login" style={{ color: '#c5a059', fontWeight: 700 }}>Sign in here</Link></>
                        ) : (
                            <>Verification code sent to <strong>{formData.email}</strong></>
                        )}
                    </p>

                    {error && (
                        <div style={{ padding: '14px 18px', background: '#fff5f5', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '28px' }}>
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={onSubmitRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
                                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                                { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', minLength: '6' },
                                { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', minLength: '6' },
                            ].map(field => (
                                <div key={field.name} className="form-field">
                                    <label>{field.label}</label>
                                    <input
                                        type={field.type} name={field.name} required
                                        minLength={field.minLength}
                                        placeholder={field.placeholder}
                                        value={formData[field.name]}
                                        onChange={onChange}
                                    />
                                </div>
                            ))}
                            <button
                                type="submit" disabled={loading}
                                style={{
                                    padding: '18px', background: loading ? '#888' : '#000',
                                    color: '#c5a059', fontSize: '0.75rem', fontWeight: 800,
                                    letterSpacing: '3px', textTransform: 'uppercase', border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
                                }}
                            >{loading ? 'Creating Account…' : 'Create Account'}</button>
                        </form>
                    ) : (
                        <form onSubmit={onSubmitVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-field">
                                <label>Verification Code</label>
                                <input
                                    type="text" required
                                    placeholder="123456"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    style={{
                                        letterSpacing: '10px',
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 700
                                    }}
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                style={{
                                    padding: '18px', background: loading ? '#888' : '#000',
                                    color: '#c5a059', fontSize: '0.75rem', fontWeight: 800,
                                    letterSpacing: '3px', textTransform: 'uppercase', border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
                                }}
                            >{loading ? 'Verifying…' : 'Verify and Register'}</button>
                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                style={{
                                    background: 'none', border: 'none', color: '#666', 
                                    textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem'
                                }}
                            >Back to Registration</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
