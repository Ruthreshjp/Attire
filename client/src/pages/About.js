import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../utils/useScrollAnimation';

import { DEFAULT_ABOUT_DATA } from '../utils/defaultContent';

const About = () => {
    const [aboutData, setAboutData] = useState(DEFAULT_ABOUT_DATA);
    const [loading, setLoading] = useState(true);
    useScrollAnimation();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/content/about`)
            .then(r => r.json())
            .then(content => {
                if (content && !content.message) { // Check if it's not an error message
                    const merged = {
                        ...DEFAULT_ABOUT_DATA,
                        ...content,
                        hero: { ...DEFAULT_ABOUT_DATA.hero, ...content.hero },
                        sections: content.sections && content.sections.length > 0 ? content.sections : DEFAULT_ABOUT_DATA.sections,
                        values: content.values && content.values.length > 0 ? content.values : DEFAULT_ABOUT_DATA.values,
                        cta: { ...DEFAULT_ABOUT_DATA.cta, ...content.cta }
                    };
                    if (content.metadata) Object.assign(merged, content.metadata);
                    setAboutData(merged);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ paddingTop: '80px' }}>
            <Navbar />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '2px solid #f0f0f0', borderTop: '2px solid #c5a059', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#aaa', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Loading</p>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ paddingTop: '80px' }}>
            <Navbar />

            {/* ── HERO ── */}
            <div style={{
                position: 'relative', height: '80vh', minHeight: '550px', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <img
                    src={aboutData.hero.image}
                    alt="About Hero"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 10%' }}>
                    <p className="anim fade" style={{ fontSize: '0.7rem', letterSpacing: '6px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '20px' }}>Our Identity</p>
                    <h1 className="anim from-bottom delay-1" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(3rem,6vw,6rem)', color: '#fff', lineHeight: 1.05, marginBottom: '20px' }}>
                        {aboutData.hero.title}
                    </h1>
                    <p className="anim from-bottom delay-2" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto' }}>
                        {aboutData.hero.subtitle}
                    </p>
                </div>
            </div>

            {/* ── STORY SECTIONS ── */}
            {(aboutData.sections || []).map((section, index) => (
                <section key={index} style={{
                    padding: '120px 8%',
                    background: index % 2 === 0 ? '#fff' : '#f9f7f4'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                        {section.image && (
                            <div className="anim from-left" style={{ overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={section.image}
                                    alt={section.title}
                                    style={{ width: '100%', height: '560px', objectFit: 'cover', display: 'block' }}
                                />
                                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', background: '#c5a059', zIndex: -1 }} />
                            </div>
                        )}
                        <div className="anim from-right">
                            <p style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '16px' }}>Chapter {index + 1}</p>
                            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,3.5vw,3rem)', marginBottom: '30px', lineHeight: 1.1 }}>
                                {section.title}
                            </h2>
                            <div style={{ width: '50px', height: '1px', background: '#c5a059', marginBottom: '28px' }} />
                            {section.content.split('\n\n').map((para, i) => (
                                <p key={i} style={{ color: '#666', fontSize: '1rem', lineHeight: 1.9, marginBottom: '16px' }}>{para}</p>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* ── VALUES ── */}
            <section style={{ padding: '120px 8%', background: '#000' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <p className="anim fade" style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '16px' }}>What We Stand For</p>
                    <h2 className="anim from-bottom delay-1" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,4vw,4rem)', color: '#fff' }}>Our Core Values</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2px', maxWidth: '1200px', margin: '0 auto' }}>
                    {(aboutData.values || []).map((value, index) => (
                        <div
                            key={index}
                            className={`anim from-bottom delay-${index + 1}`}
                            style={{
                                padding: '50px 40px',
                                background: '#111', border: '1px solid #1e1e1e',
                                transition: 'border-color 0.4s, transform 0.4s',
                                cursor: 'default'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#c5a059'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '24px' }}>{value.icon}</div>
                            <h3 style={{ color: '#fff', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', marginBottom: '14px' }}>{value.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', lineHeight: 1.8 }}>{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PROMISE / PHILOSOPHY STRIP ── */}
            <section style={{ padding: '120px 8%', background: '#f9f7f4' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="anim from-left">
                        <p style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '16px' }}>The Promise</p>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,3.5vw,3rem)', marginBottom: '28px', lineHeight: 1.1 }}>
                            {aboutData.promise?.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>) || 'Excellence is Our Standard'}
                        </h2>
                        <div style={{ width: '50px', height: '1px', background: '#c5a059', marginBottom: '28px' }} />
                        <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.9, marginBottom: '24px' }}>
                            {aboutData.promise?.desc1}
                        </p>
                        <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.9, marginBottom: '40px' }}>
                            {aboutData.promise?.desc2}
                        </p>
                        <div style={{ display: 'flex', gap: '40px' }}>
                            {(aboutData.promise?.stats || [['2026', 'Founded'], ['5K+', 'Customers'], ['200+', 'Styles']]).map((s, i) => (
                                <div key={i} className="anim from-bottom">
                                    <span style={{ display: 'block', fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', fontWeight: 700, color: '#000' }}>{s.n || s[0]}</span>
                                    <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa' }}>{s.l || s[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="anim from-right" style={{ overflow: 'hidden', position: 'relative' }}>
                        <img
                            src={aboutData.promise?.image || "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80"}
                            alt="Our store"
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
                <p className="anim fade" style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '20px' }}>Ready to Begin?</p>
                <h2 className="anim from-bottom delay-1" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,4vw,4rem)', color: '#fff', marginBottom: '20px' }}>
                    {aboutData.cta.title}
                </h2>
                <p className="anim from-bottom delay-2" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', marginBottom: '50px', maxWidth: '560px', margin: '0 auto 50px' }}>
                    {aboutData.cta.description}
                </p>
                <Link to="/products" className="btn-gold anim zoom-in delay-3" style={{ display: 'inline-flex' }}>
                    Explore Collection
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </section>
        </div>
    );
};

export default About;
