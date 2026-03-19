import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
    const { toggleWishlist, isWishlisted } = useWishlist();
    const productId = product._id || product.id;
    const wishlisted = isWishlisted(productId);

    const getFullImgUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/600x800?text=No+Image';
        if (typeof url !== 'string') return url.url || 'https://via.placeholder.com/600x800?text=No+Image';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `http://localhost:5000/${url}`;
    };

    const displayImage = getFullImgUrl(product.images?.[0] || product.image);

    const hasDiscount = product.originalPrice && product.price < product.originalPrice;
    const discountPct = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : product.discount;

    const handleWishlist = (e) => {
        e.preventDefault(); e.stopPropagation();
        toggleWishlist(product);
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <Link to={`/product/${productId}`}>
                    <img src={displayImage} alt={product.name} className="product-image" />
                </Link>

                {/* Badges */}
                {product.isNewArrival && <span className="product-badge new">New Arrival</span>}

                {/* Wishlist */}
                <button
                    className={`wishlist-btn${wishlisted ? ' active' : ''}`}
                    onClick={handleWishlist}
                    title="Add to Wishlist"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>

            <div className="product-info">
                <p className="product-category">{product.category}</p>
                <Link to={`/product/${productId}`} className="product-name-link">
                    <h3 className="product-name">{product.name}</h3>
                </Link>
                <div className="product-price">
                    {product.isSpecialOffer ? (
                        <>
                            <span className="current-price">₹{(product.price || product.originalPrice || 0).toLocaleString('en-IN')}</span>
                            <span className="offer-percentage" style={{ background: '#c5a059', color: '#000' }}>Promo Code Req.</span>
                        </>
                    ) : hasDiscount ? (
                        <>
                            <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                            <span className="offer-percentage">{discountPct}% OFF</span>
                        </>
                    ) : (
                        <span className="current-price">₹{(product.price || product.originalPrice || 0).toLocaleString('en-IN')}</span>
                    )}
                </div>
                {product.couponCode && (
                    <div className="promo-badge-vessel" style={{ marginTop: '10px', padding: '6px 12px', background: '#fff9e6', border: '1px solid #ffd700', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                        <span className="p-icon" style={{ fontSize: '0.9rem' }}>🏷️</span>
                        <span style={{ fontSize: '0.8rem', color: '#856404', fontWeight: 600 }}>
                            Use code <strong>{product.couponCode}</strong> for extra <strong>{product.extraDiscount || Math.round(((product.price - (product.specialPrice || product.price * 0.9)) / (product.price || 1)) * 100)}%</strong> off
                        </span>
                    </div>
                )}
                {product.colors && product.colors.length > 0 && (
                    <div className="product-colors">
                        {product.colors.slice(0, 5).map((c, i) => (
                            <span key={i} className="color-dot" style={{ backgroundColor: c.hexCode || c }} title={c.name || ''} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
