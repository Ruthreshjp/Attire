import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';


const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();

    const productId = product?._id || product?.id;
    const wishlisted = isWishlisted(productId);

    // Sample product data - will be fetched from API
    const productData = {
        id: parseInt(id),
        name: 'Classic White Shirt',
        category: 'Men\'s Shirts',
        price: 3999,
        originalPrice: 6399,
        discount: 38,
        images: [
            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
            'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
            'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80'
        ],
        rating: 4.5,
        totalReviews: 234,
        description: 'Premium quality cotton shirt with a classic fit. Perfect for both casual and formal occasions. Made from 100% Egyptian cotton with a soft, breathable fabric that keeps you comfortable all day long.',
        features: [
            '100% Premium Egyptian Cotton',
            'Classic Fit Design',
            'Machine Washable',
            'Wrinkle Resistant',
            'Breathable Fabric',
            'Button-Down Collar'
        ],
        colors: [
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Black', hex: '#000000' },
            { name: 'Navy Blue', hex: '#000080' },
            { name: 'Light Blue', hex: '#4A90E2' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 45,
        sold: 1250,
        sku: 'ATR-SH-001',
        reviews: [
            {
                id: 1,
                user: 'John Doe',
                rating: 5,
                date: '2026-02-10',
                comment: 'Excellent quality! The fabric is soft and the fit is perfect. Highly recommended!',
                verified: true
            },
            {
                id: 2,
                user: 'Mike Smith',
                rating: 4,
                date: '2026-02-08',
                comment: 'Great shirt, but runs slightly large. Consider ordering one size down.',
                verified: true
            },
            {
                id: 3,
                user: 'David Wilson',
                rating: 5,
                date: '2026-02-05',
                comment: 'Best shirt I\'ve bought online. Will definitely order more colors!',
                verified: true
            }
        ]
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${id}`);
                const data = await response.json();
                if (data.success) {
                    setProduct(data.product);
                    if (data.product.colors && data.product.colors.length > 0) {
                        setSelectedColor(data.product.colors[0].hexCode || data.product.colors[0].hex || '');
                    }
                }
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const getImageUrl = (img) => {
        if (!img) return '';
        return typeof img === 'string' ? img : img.url;
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(product, selectedSize, selectedColor);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(product, selectedSize, selectedColor);
        navigate('/cart');
    };

    const handleWishlist = () => {
        toggleWishlist(product);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <img src="/attire-logo.svg" alt="Loading" className="loading-logo" />
                <div className="spinner"></div>
                <p>Loading Product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <h2>Product Not Found</h2>
                <button onClick={() => navigate('/products')}>Back to Products</button>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <Navbar />

            <div className="product-detail-container">
                <div className="product-detail-content">
                    {/* Product Images */}
                    <div className="product-images">
                        <div className="main-image">
                            <img src={getImageUrl(product.images[selectedImage])} alt={product.name} />
                            <button
                                className={`wishlist-btn-large ${wishlisted ? 'active' : ''}`}
                                onClick={handleWishlist}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                        </div>
                        <div className="image-thumbnails">
                            {(product.images || []).map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={getImageUrl(img)} alt={`${product.name} ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-meta">
                            <div className="product-rating-section">
                                <div className="stars">
                                    {[...Array(5)].map((_, index) => (
                                        <svg
                                            key={index}
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill={index < Math.floor(product.rating) ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="rating-text">{product.rating || 0} ({(product.reviews || []).length} reviews)</span>
                            </div>
                        </div>

                        <div className="product-price-section">
                            <div className="price-wrapper">
                                {product.originalPrice && (
                                    <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                )}
                                <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                                {product.discount && (
                                    <span className="discount-badge">-{product.discount}% OFF</span>
                                )}
                            </div>
                            <p className="tax-info">Inclusive of all taxes</p>
                        </div>

                        {/* Color Selection */}
                        <div className="selection-section">
                            <label>Select Color:</label>
                            <div className="color-options">
                                {(product.colors || []).map((color, index) => (
                                    <div
                                        key={index}
                                        className={`color-option ${selectedColor === color.hexCode ? 'active' : ''}`}
                                        onClick={() => setSelectedColor(color.hexCode)}
                                        title={color.name}
                                    >
                                        <span
                                            className="color-circle"
                                            style={{ backgroundColor: color.hexCode }}
                                        ></span>
                                        <span className="color-name">{color.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="selection-section">
                            <label>Select Size:</label>
                            <div className="size-options">
                                {(product.sizes || []).map((size, index) => (
                                    <button
                                        key={index}
                                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <a href="#size-guide" className="size-guide-link">Size Guide</a>
                        </div>

                        {/* Quantity */}
                        <div className="selection-section">
                            <label>Quantity:</label>
                            <div className="quantity-selector">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`} onClick={handleAddToCart}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {addedToCart ? 'Added ✓' : 'Add to Cart'}
                            </button>
                            <button className="buy-now-btn" onClick={handleBuyNow}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Buy Now
                            </button>
                        </div>

                        {/* Product Description */}
                        <div className="product-description">
                            <h3>Product Description</h3>
                            <p>{product.description}</p>
                        </div>


                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h2>Customer Reviews</h2>
                        <div className="reviews-summary">
                            <div className="average-rating">
                                <span className="rating-number">{product.rating}</span>
                                <div className="stars-large">
                                    {[...Array(5)].map((_, index) => (
                                        <svg
                                            key={index}
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill={index < Math.floor(product.rating) ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                </div>
                                <p>{product.totalReviews} Reviews</p>
                            </div>
                            <button
                                className="write-review-btn"
                                onClick={() => setShowReviewForm(!showReviewForm)}
                            >
                                Write a Review
                            </button>
                        </div>
                    </div>

                    {showReviewForm && (
                        <div className="review-form">
                            <h3>Write Your Review</h3>
                            <form>
                                <div className="form-group">
                                    <label>Rating:</label>
                                    <div className="star-rating-input">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Your Review:</label>
                                    <textarea rows="4" placeholder="Share your experience with this product..."></textarea>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-review-btn">Submit Review</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowReviewForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="reviews-list">
                        {(product.reviews || []).map((review) => (
                            <div key={review._id || review.id} className="review-item">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar">
                                            {(review.user || "A").charAt(0)}
                                        </div>
                                        <div>
                                            <h4>{review.user}</h4>
                                            {review.verified && (
                                                <span className="verified-badge">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="review-date">{review.date}</span>
                                </div>
                                <div className="review-rating">
                                    {[...Array(5)].map((_, index) => (
                                        <svg
                                            key={index}
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill={index < review.rating ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductDetail;
