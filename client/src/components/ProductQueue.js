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
            </div>

            <div className="product-queue-container" ref={scrollContainerRef}>
                <div className="product-queue">
                    {products.map((product) => (
                        <div key={product._id || product.id} className="product-queue-item">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductQueue;
