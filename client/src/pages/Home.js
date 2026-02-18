import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import OffersCarousel from '../components/OffersCarousel';
import ProductQueue from '../components/ProductQueue';


const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products for different sections
    const bestSellers = products.slice(0, 5);
    const recentlyViewed = products.slice(5, 10);
    const recommended = products.slice(2, 7);

    if (loading) return <div className="loading-state">Syncing Catalog...</div>;

    return (
        <div className="home-page">
            <Navbar />

            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Offers Carousel */}
            <OffersCarousel />

            {/* Most Sold Products */}
            <ProductQueue
                title="Best Sellers"
                subtitle="Our most popular items loved by customers"
                products={bestSellers}
            />

            {/* Recently Viewed */}
            <div className="section-divider"></div>
            <ProductQueue
                title={recentlyViewed.length > 0 ? "Recently Viewed" : "Trending Products"}
                subtitle={recentlyViewed.length > 0 ? "Continue where you left off" : "Popular picks this week"}
                products={recentlyViewed.length > 0 ? recentlyViewed : bestSellers}
            />

            {/* Recommended Products */}
            <div className="section-divider"></div>
            <ProductQueue
                title="Recommended for You"
                subtitle="Based on your preferences"
                products={recommended.length > 0 ? recommended : bestSellers}
            />

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
