import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductQueue = ({ title, subtitle, products }) => {
    const scrollRef = useRef(null);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="product-queue-section">
            <div className="queue-header">
                <div className="queue-title-wrapper">
                    {subtitle && <p className="queue-pre">{subtitle}</p>}
                    <h2 className="queue-title">{title}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/products" className="queue-view-all">View All</Link>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => scroll('left')}
                            style={{
                                width: '44px', height: '44px', border: '1px solid #e8e8e8',
                                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: '0.3s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.borderColor = '#000'; e.currentTarget.querySelector('svg').style.stroke = '#c5a059'; }}
                            onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.querySelector('svg').style.stroke = '#000'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" style={{ transition: '0.3s' }}>
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            style={{
                                width: '44px', height: '44px', border: '1px solid #e8e8e8',
                                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: '0.3s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.borderColor = '#000'; e.currentTarget.querySelector('svg').style.stroke = '#c5a059'; }}
                            onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.querySelector('svg').style.stroke = '#000'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" style={{ transition: '0.3s' }}>
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="product-queue-container" ref={scrollRef}>
                <div className="product-queue">
                    {products.map((product) => (
                        <div key={product._id || product.id} className="product-queue-item">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductQueue;
