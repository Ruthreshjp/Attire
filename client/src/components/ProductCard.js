import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleProtectedAction = (e, actionType) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (actionType === 'wishlist') {
            setIsWishlisted(!isWishlisted);
        } else if (actionType === 'cart') {
            alert('Added to cart!');
        } else if (actionType === 'buy') {
            navigate('/cart');
        }
    };

    // Use images array if available, otherwise fallback
    const displayImage = product.images && product.images[0]
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
        : product.image;

    // Calculate discount percentage if original price is available
    const hasDiscount = product.originalPrice && product.price < product.originalPrice;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : product.discount;

    return (
        <div className="product-card">
            <div className="product-image-container">
                <Link to={`/product/${product._id || product.id}`}>
                    <img
                        src={displayImage}
                        alt={product.name}
                        className="product-image"
                    />
                </Link>
                {product.isNewArrival && <span className="product-badge new">New Arrival</span>}
                {hasDiscount && (
                    <span className="product-badge discount">-{discountPercent}%</span>
                )}
                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={(e) => handleProtectedAction(e, 'wishlist')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>

            <div className="product-info">
                <p className="product-category">{product.category}</p>
                <Link to={`/product/${product._id || product.id}`} className="product-name-link">
                    <h3 className="product-name">{product.name}</h3>
                </Link>

                <div className="product-rating">
                    {[...Array(5)].map((_, index) => (
                        <svg
                            key={index}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={index < Math.floor(product.rating || 0) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    ))}
                    <span className="rating-count">({product.reviewsCount || product.reviews || 0})</span>
                </div>

                <div className="product-price">
                    {hasDiscount ? (
                        <>
                            <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            <span className="current-price discounted-price">₹{product.price.toLocaleString('en-IN')}</span>
                            <span className="offer-percentage">{discountPercent}% OFF</span>
                        </>
                    ) : (
                        <span className="current-price">₹{(product.price || product.originalPrice).toLocaleString('en-IN')}</span>
                    )}
                </div>

                {product.colors && product.colors.length > 0 && (
                    <div className="product-colors">
                        {product.colors.map((color, index) => (
                            <span
                                key={index}
                                className="color-dot"
                                style={{ backgroundColor: color.hexCode || color }}
                                title={color.name || color}
                            ></span>
                        ))}
                    </div>
                )}

                <div className="product-action-buttons">
                    <button
                        className="buy-now-btn-card"
                        onClick={(e) => handleProtectedAction(e, 'buy')}
                    >
                        Buy Now
                    </button>
                    <button
                        className="add-to-cart-btn-card"
                        onClick={(e) => handleProtectedAction(e, 'cart')}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            <style>{`
                .product-action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 15px;
                }
                .buy-now-btn-card, .add-to-cart-btn-card {
                    width: 100%;
                    padding: 10px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .buy-now-btn-card {
                    background: #1a1a1a;
                    color: white;
                }
                .buy-now-btn-card:hover {
                    background: #333;
                }
                .add-to-cart-btn-card {
                    background: transparent;
                    color: #1a1a1a;
                    border: 1px solid #1a1a1a;
                }
                .add-to-cart-btn-card:hover {
                    background: #f5f5f5;
                }
            `}</style>
        </div>
    );
};

export default ProductCard;
