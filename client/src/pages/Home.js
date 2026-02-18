import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import OffersCarousel from '../components/OffersCarousel';
import ProductQueue from '../components/ProductQueue';
import CategoryGrid from '../components/CategoryGrid';


const Home = () => {
    const [products, setProducts] = useState([]);
    const [pageContent, setPageContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [prodRes, contentRes] = await Promise.all([
                    fetch('http://localhost:5000/api/products'),
                    fetch('http://localhost:5000/api/content/home')
                ]);

                const prodData = await prodRes.json();
                const contentData = await contentRes.json();

                if (prodData.success) setProducts(prodData.products);
                if (contentRes.ok) setPageContent(contentData);

            } catch (err) {
                console.error('Error fetching home data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // Filter products for different sections
    let bestSellers = products.filter(p => p.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 5);
    if (bestSellers.length === 0) bestSellers = products.slice(0, 5);

    const trending = products.filter(p => !p.isNewArrival).slice(0, 5);

    // Dynamic Recently Viewed
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const recentlyViewed = viewedIds
        .map(vId => products.find(p => (p._id || p.id) === vId))
        .filter(Boolean);

    const recommended = products.filter(p => p.isFeatured).slice(0, 5);

    if (loading) return <div className="loading-state">Syncing Catalog...</div>;

    console.log('Current Home Page Content:', pageContent);

    return (
        <div className="home-page">
            <Navbar />

            {/* Hero Carousel */}
            <HeroCarousel slides={pageContent?.carousel} />

            {/* Shop Drop Category Grid */}
            <CategoryGrid categories={pageContent?.categories} />

            {/* Offers Carousel */}
            <OffersCarousel />

            {/* Most Sold Products */}
            <ProductQueue
                title="Best Sellers"
                subtitle="Our most popular items loved by customers"
                products={bestSellers}
            />

            {/* Recently Viewed / Trending */}
            <div className="section-divider"></div>
            <ProductQueue
                title={recentlyViewed.length > 0 ? "Recently Viewed" : "Trending Products"}
                subtitle={recentlyViewed.length > 0 ? "Continue where you left off" : "Popular picks this week"}
                products={recentlyViewed.length > 0 ? recentlyViewed : trending}
            />

            {/* Recommended Products */}
            <div className="section-divider"></div>
            <ProductQueue
                title="Recommended for You"
                subtitle="Based on your preferences"
                products={recommended.length > 0 ? recommended : bestSellers}
            />

            {/* Brand Experience Section */}
            <section className="brand-philosophy reveal-anim">
                <div className="philosophy-content">
                    <span className="subtitle">{pageContent?.brandPhilosophy?.subtitle || 'The Art of Attire'}</span>
                    <h2>{pageContent?.brandPhilosophy?.title || 'Elegance in Every Detail'}</h2>
                    <p>{pageContent?.brandPhilosophy?.description || 'At ATTIRE, we believe that fashion is a silent language...'}</p>
                    <div className="philosophy-stats">
                        {(pageContent?.brandPhilosophy?.stats || [
                            { number: '100%', label: 'Premium Material' },
                            { number: '24h', label: 'Express Checkout' },
                            { number: '5k+', label: 'Happy Clients' }
                        ]).map((stat, idx) => (
                            <div key={idx} className="stat">
                                <span className="stat-number">{stat.number}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="philosophy-image">
                    <img
                        src={pageContent?.brandPhilosophy?.image || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80"}
                        alt="Luxury Store"
                    />
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="newsletter-container">
                    <div className="newsletter-content">
                        <h3>{pageContent?.newsletter?.title || 'Join The Club'}</h3>
                        <p>{pageContent?.newsletter?.description || 'Receive exclusive early access to new collections and luxury fashion insights.'}</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Your email address" required />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>ATTIRE</h3>
                        <p>Premium fashion for the modern individual</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/shipping">Shipping Info</a></li>
                            <li><a href="/returns">Returns</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Customer Service</h4>
                        <ul>
                            <li><a href="/faq">FAQ</a></li>
                            <li><a href="/size-guide">Size Guide</a></li>
                            <li><a href="/track-order">Track Order</a></li>
                            <li><a href="/support">Support</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a href="https://www.instagram.com/attire_tiruchengode?igsh=ODNkZTB2bmh3dTQz" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Attire. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
