import React, { useRef } from 'react';
import ProductCard from './ProductCard';


const ProductQueue = ({ title, subtitle, products }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 320;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="product-queue-section">
            <div className="queue-header">
                <div className="queue-title-wrapper">
                    <h2 className="queue-title">{title}</h2>
                    {subtitle && <p className="queue-subtitle">{subtitle}</p>}
                </div>
                <div className="queue-controls">
                    <button
                        className="queue-arrow queue-arrow-left"
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        className="queue-arrow queue-arrow-right"
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="product-queue-container" ref={scrollContainerRef}>
                <div className="product-queue">
                    {products.map((product) => (
                        <div key={product.id} className="product-queue-item">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductQueue;
