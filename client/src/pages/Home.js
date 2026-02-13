import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import OffersCarousel from '../components/OffersCarousel';
import ProductQueue from '../components/ProductQueue';


const Home = () => {
    // Sample product data - will be fetched from backend
    const [mostSoldProducts] = useState([
        {
            id: 1,
            name: 'Classic White Shirt',
            category: 'Men\'s Clothing',
            price: 3999,
            originalPrice: 6399,
            discount: 38,
            image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
            rating: 4.5,
            reviews: 234,
            colors: ['#FFFFFF', '#000000', '#4A90E2'],
            isNew: false
        },
        {
            id: 2,
            name: 'Luxury Chronograph Watch',
            category: 'Accessories',
            price: 12999,
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
            rating: 5,
            reviews: 189,
            colors: ['#000000', '#C0C0C0', '#B8860B'],
            isNew: true
        },
        {
            id: 3,
            name: 'Leather Jacket',
            category: 'Outerwear',
            price: 15999,
            originalPrice: 23999,
            discount: 33,
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
            rating: 4.8,
            reviews: 156,
            colors: ['#000000', '#8B4513'],
            isNew: false
        },
        {
            id: 4,
            name: 'Casual Denim Jeans',
            category: 'Men\'s Clothing',
            price: 5599,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
            rating: 4.3,
            reviews: 312,
            colors: ['#4169E1', '#000000'],
            isNew: false
        },
        {
            id: 5,
            name: 'Premium Silk Tie Set',
            category: 'Accessories',
            price: 1999,
            originalPrice: 2999,
            discount: 33,
            image: 'https://images.unsplash.com/photo-1589756823851-ede1be674188?w=600&q=80',
            rating: 4.7,
            reviews: 98,
            colors: ['#8B0000', '#000080', '#000000'],
            isNew: true
        }
    ]);

    const [recentlyViewed] = useState([
        {
            id: 6,
            name: 'Striped T-Shirt',
            category: 'Casual Wear',
            price: 2399,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
            rating: 4.2,
            reviews: 87,
            colors: ['#FFFFFF', '#000000', '#FF6B6B'],
            isNew: false
        },
        {
            id: 7,
            name: 'Wool Blazer',
            category: 'Formal Wear',
            price: 11999,
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
            rating: 4.6,
            reviews: 145,
            colors: ['#000000', '#808080', '#000080'],
            isNew: false
        },
        {
            id: 8,
            name: 'Knit Sweater',
            category: 'Winter Collection',
            price: 4799,
            originalPrice: 7199,
            discount: 33,
            image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
            rating: 4.4,
            reviews: 76,
            colors: ['#8B4513', '#000000', '#FFFFFF'],
            isNew: false
        },
        {
            id: 9,
            name: 'Athletic Shorts',
            category: 'Sportswear',
            price: 2799,
            image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
            rating: 4.1,
            reviews: 203,
            colors: ['#000000', '#808080', '#4169E1'],
            isNew: false
        },
        {
            id: 10,
            name: 'Silk Scarf',
            category: 'Accessories',
            price: 3199,
            image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
            rating: 4.9,
            reviews: 54,
            colors: ['#FFB6C1', '#87CEEB', '#FFD700'],
            isNew: true
        }
    ]);

    const [recentlyBought] = useState([
        {
            id: 11,
            name: 'Running Shoes',
            category: 'Footwear',
            price: 9599,
            originalPrice: 12799,
            discount: 25,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
            rating: 4.7,
            reviews: 432,
            colors: ['#FFFFFF', '#000000', '#FF0000'],
            isNew: false
        },
        {
            id: 12,
            name: 'Premium Leather Briefcase',
            category: 'Accessories',
            price: 8999,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
            rating: 4.5,
            reviews: 167,
            colors: ['#000000', '#8B4513'],
            isNew: false
        },
        {
            id: 13,
            name: 'Sunglasses',
            category: 'Accessories',
            price: 10399,
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
            rating: 4.8,
            reviews: 289,
            colors: ['#000000', '#8B4513'],
            isNew: true
        },
        {
            id: 14,
            name: 'Polo Shirt',
            category: 'Men\'s Clothing',
            price: 3599,
            originalPrice: 4799,
            discount: 25,
            image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80',
            rating: 4.3,
            reviews: 198,
            colors: ['#FFFFFF', '#000000', '#000080', '#FF0000'],
            isNew: false
        },
        {
            id: 15,
            name: 'Ankle Boots',
            category: 'Footwear',
            price: 11199,
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
            rating: 4.6,
            reviews: 234,
            colors: ['#000000', '#8B4513'],
            isNew: false
        }
    ]);

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
                products={mostSoldProducts}
            />

            {/* Recently Viewed */}
            <div className="section-divider"></div>
            <ProductQueue
                title="Recently Viewed"
                subtitle="Continue where you left off"
                products={recentlyViewed}
            />

            {/* Recently Bought */}
            <div className="section-divider"></div>
            <ProductQueue
                title="Recently Purchased"
                subtitle="Fresh off the shelves"
                products={recentlyBought}
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
                            <a href="#" aria-label="Instagram">Instagram</a>
                            <a href="#" aria-label="Facebook">Facebook</a>
                            <a href="#" aria-label="Twitter">Twitter</a>
                            <a href="#" aria-label="Pinterest">Pinterest</a>
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
