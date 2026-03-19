import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import OffersCarousel from '../components/OffersCarousel';
import ProductQueue from '../components/ProductQueue';
import useScrollAnimation from '../utils/useScrollAnimation';

import { DEFAULT_HOME_DATA } from '../utils/defaultContent';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [homeData, setHomeData] = useState(DEFAULT_HOME_DATA);
    const [pageContent, setPageContent] = useState(null);
    useScrollAnimation();

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:5000/api/products').then(r => r.json()),
            fetch('http://localhost:5000/api/content/home').then(r => r.json())
        ]).then(([prod, content]) => {
            if (prod.success) setProducts(prod.products);
            
            if (content) {
                setPageContent(content);
                const merged = {
                    ...DEFAULT_HOME_DATA,
                    ...content,
                    signature: { ...DEFAULT_HOME_DATA.signature, ...content.signature },
                    lifestyle: { ...DEFAULT_HOME_DATA.lifestyle, ...content.lifestyle },
                    newArrivals: { ...DEFAULT_HOME_DATA.newArrivals, ...content.newArrivals },
                    trending: { ...DEFAULT_HOME_DATA.trending, ...content.trending },
                    editorial1: { ...DEFAULT_HOME_DATA.editorial1, ...content.editorial1 },
                    craft: { ...DEFAULT_HOME_DATA.craft, ...content.craft },
                    flagship: { ...DEFAULT_HOME_DATA.flagship, ...content.flagship },
                    editorial2: { ...DEFAULT_HOME_DATA.editorial2, ...content.editorial2 },
                    newsletter: { ...DEFAULT_HOME_DATA.newsletter, ...content.newsletter },
                    footer: { ...DEFAULT_HOME_DATA.footer, ...content.footer }
                };
                if (content.metadata) Object.assign(merged, content.metadata);
                setHomeData(merged);
            }
        }).catch(console.error);
    }, []);

    const sortByNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    const trending = products.filter(p => !p.isNewArrival).sort(sortByNewest).slice(0, 8);
    const newArrivals = products.filter(p => p.isNewArrival).sort(sortByNewest).slice(0, 8);

    return (
        <div style={{ paddingTop: '80px' }}>
            <Navbar />

            {/* ── HERO ── */}
            <HeroCarousel slides={pageContent?.carousel} />

            {/* ── TICKER ── */}
            <div className="ticker-bar">
                <div className="ticker-track">
                    {[...(homeData.ticker || []), ...(homeData.ticker || [])].map((item, i) => (
                        <span key={i} className="ticker-item">
                            {item}
                            <span className="ticker-dot" />
                        </span>
                    ))}
                </div>
            </div>

            {/* ── SIGNATURE HIGHLIGHT ── */}
            <section className="signature-highlight anim fade">
                <div className="signature-content">
                    <p className="signature-pre">{homeData.signature.pre}</p>
                    <h2 className="signature-title">
                        {homeData.signature.title.split('\n')[0]}
                        <br />
                        <em>{homeData.signature.title.split('\n')[1]}</em>
                    </h2>
                    <p className="signature-desc">{homeData.signature.desc}</p>
                    <Link to={homeData.signature.link || "/products"} className="signature-link">
                        {homeData.signature.linkText}
                    </Link>
                </div>
                <div className="signature-visual">
                    <img src={homeData.signature.image} alt="Signature Feature" className="anim from-right" />
                </div>
            </section>

            {/* ── LIFESTYLE EDITORIAL ── */}
            <section className="lifestyle-showcase anim fade">
                <div className="lifestyle-grid">
                    <div className="lifestyle-item main anim from-left">
                        <img src={homeData.lifestyle.main.image} alt="Lifestyle" />
                        <div className="lifestyle-overlay">
                             <p className="lifestyle-lbl">{homeData.lifestyle.main.label}</p>
                             <h2>{homeData.lifestyle.main.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</h2>
                             <Link to={homeData.lifestyle.main.link || "/products"} className="lifestyle-btn">
                                {homeData.lifestyle.main.btnText}
                             </Link>
                        </div>
                    </div>
                    <div className="lifestyle-side">
                         <div className="lifestyle-item small anim from-right delay-1">
                             <img src={homeData.lifestyle.side1.image} alt="Detail 1" />
                             <div className="lifestyle-overlay">
                                 <h3>{homeData.lifestyle.side1.title}</h3>
                             </div>
                         </div>
                         <div className="lifestyle-item small anim from-right delay-2">
                             <img src={homeData.lifestyle.side2.image} alt="Detail 2" />
                             <div className="lifestyle-overlay">
                                 <h3>{homeData.lifestyle.side2.title}</h3>
                             </div>
                         </div>
                    </div>
                </div>
            </section>

            {/* ── NEW ARRIVALS ── */}
            {newArrivals.length > 0 && (
                <div className="anim from-bottom">
                    <ProductQueue
                        title={homeData.newArrivals.title}
                        subtitle={homeData.newArrivals.subtitle}
                        products={newArrivals}
                    />
                </div>
            )}

            {/* ── EDITORIAL BANNER 1 ── */}
            <section className="editorial-banner anim fade">
                <img src={homeData.editorial1.image} alt="Editorial" />
                <div className="editorial-overlay" />
                <div className="editorial-content">
                    <p className="eyebrow">{homeData.editorial1.eyebrow}</p>
                    <h2>{homeData.editorial1.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</h2>
                    <p>{homeData.editorial1.desc}</p>
                    <Link to={homeData.editorial1.link || "/about"} className="btn-gold">{homeData.editorial1.linkText}</Link>
                </div>
            </section>

            {/* ── OFFERS ── */}
            <div className="anim from-bottom">
                <OffersCarousel />
            </div>

            {/* ── TRENDING ── */}
            {trending.length > 0 && (
                <div className="anim from-bottom">
                    <ProductQueue
                        title={homeData.trending.title}
                        subtitle={homeData.trending.subtitle}
                        products={trending}
                    />
                </div>
            )}

            {/* ── CRAFT SECTION ── */}
            <section className="craft-section">
                <div style={{ textAlign: 'center' }}>
                    <p className="anim fade" style={{ fontSize: '0.7rem', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, marginBottom: '14px' }}>
                        {homeData.craft.pre}
                    </p>
                    <h2 className="anim from-bottom delay-1" style={{ fontSize: 'clamp(2rem,4vw,3.5rem)' }}>
                        {homeData.craft.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
                    </h2>
                </div>
                <div className="craft-grid">
                    {(homeData.craft.features || []).map((f, i) => (
                        <div key={i} className={`craft-card anim from-bottom delay-${i + 2}`}>
                            <div className="craft-icon">
                                {i === 0 ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> : 
                                 i === 1 ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> :
                                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SPLIT FEATURE ── */}
            <div className="split-section">
                <div className="split-image anim from-left">
                    <img src={homeData.flagship.image} alt="Flagship Store" />
                </div>
                <div className="split-content">
                    <div className="split-inner">
                        <p className="eyebrow anim fade">{homeData.flagship.eyebrow}</p>
                        <h2 className="anim from-right delay-1">
                            {homeData.flagship.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
                        </h2>
                        <p className="anim from-right delay-2">{homeData.flagship.desc}</p>
                        <div className="split-stats">
                            {(homeData.flagship.stats || []).map((s, i) => (
                                <div key={i} className={`split-stat anim from-bottom delay-${i + 3}`}>
                                    <span className="num">{s.num}</span>
                                    <span className="lbl">{s.label}</span>
                                </div>
                            ))}
                        </div>
                        <Link to={homeData.flagship.link || "/products"} className="btn-gold anim fade delay-6" style={{ display: 'inline-flex' }}>
                            {homeData.flagship.btnText}
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── EDITORIAL BANNER 2 ── */}
            <section className="editorial-banner anim fade" style={{ color: '#fff' }}>
                <img src={homeData.editorial2.image} alt="Try-On Technology" />
                <div className="editorial-overlay" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(197,160,89,0.08) 100%)' }} />
                <div className="editorial-content">
                    <p className="eyebrow">{homeData.editorial2.eyebrow}</p>
                    <h2>{homeData.editorial2.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</h2>
                    <p>{homeData.editorial2.desc}</p>
                    <Link to={homeData.editorial2.link || "/products"} className="btn-gold">{homeData.editorial2.linkText}</Link>
                </div>
            </section>

            {/* ── STATS BAND ── */}
            <div className="stats-band" style={{ borderTop: '1px solid #eee', background: '#fff' }}>
                {(homeData.statsBand || []).map((s, i) => (
                    <div key={i} className={`stat-block anim from-bottom delay-${i + 1}`}>
                        <span className="stat-num">{s.num}</span>
                        <p className="stat-label">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── NEWSLETTER ── */}
            <section className="newsletter-section">
                <p className="eyebrow anim fade">{homeData.newsletter.eyebrow}</p>
                <h2 className="anim from-bottom delay-1">{homeData.newsletter.title}</h2>
                <p className="anim from-bottom delay-2">{homeData.newsletter.desc}</p>
                <form className="newsletter-form anim zoom-in delay-3" onSubmit={e => e.preventDefault()}>
                    <input type="email" placeholder="Your email address" />
                    <button type="submit">Subscribe</button>
                </form>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand anim from-left">
                        <h3>{homeData.footer.brandName}</h3>
                        <p>{homeData.footer.brandDesc}</p>
                        <div className="social-links" style={{ marginTop: '24px' }}>
                            {(homeData.footer.socialLinks || []).map((link, i) => (
                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="social-link">{link.platform}</a>
                            ))}
                        </div>
                    </div>
                    <div className="footer-section anim from-bottom delay-2">
                        <h4>Shop</h4>
                        <ul>
                            <li><Link to="/products?category=Shirts">Shirts</Link></li>
                            <li><Link to="/products?category=Jeans">Jeans</Link></li>
                            <li><Link to="/products?category=Kurta">Kurta</Link></li>
                            <li><Link to="/products?category=T-Shirts">T-Shirts</Link></li>
                            <li><Link to="/products">All Products</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section anim from-bottom delay-3">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/my-orders">My Orders</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                            <li><Link to="/profile">My Account</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section anim from-right delay-4">
                        <h4>Support</h4>
                        <ul>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <li><a href="#">Size Guide</a></li>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <li><a href="#">Shipping Info</a></li>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <li><a href="#">Returns & Refunds</a></li>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{homeData.footer.copyright}</p>
                    <p>{homeData.footer.bottomText}</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
