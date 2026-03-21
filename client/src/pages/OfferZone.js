import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import useScrollAnimation from '../utils/useScrollAnimation';

const OfferZone = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useScrollAnimation();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/products`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Filter for special offers
                    const specialOffers = data.products.filter(p => p.isSpecialOffer || p.discount > 30);
                    setProducts(specialOffers);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000' }}>
            <Navbar forceDark={true} />

            {/* ── HEADER ── */}
            <div style={{
                padding: '80px 8% 60px',
                background: 'linear-gradient(to bottom, #111 0%, #000 100%)',
                borderBottom: '1px solid #1a1a1a',
                textAlign: 'center'
            }}>
                <p className="anim fade" style={{ fontSize: '0.7rem', letterSpacing: '6px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '20px' }}>
                    Exclusive Savings
                </p>
                <h1 className="anim from-bottom" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,6vw,5rem)', color: '#fff', lineHeight: 1, marginBottom: '24px' }}>
                    The Offer Zone
                </h1>
            </div>

            {/* ── CONTENT ── */}
            <div style={{ padding: '60px 8%' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '20px' }}>
                        <div style={{ width: '36px', height: '36px', border: '2px solid #222', borderTop: '2px solid #c5a059', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>No Active Offers</h3>
                        <p style={{ color: '#666' }}>Check back soon for exclusive seasonal drops and discounts.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '50px 30px'
                    }}>
                        {products.map((product, i) => (
                            <div key={product._id} className={`anim from-bottom delay-${(i % 4) + 1}`}>
                                <ProductCard product={product} darkTheme={true} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default OfferZone;
