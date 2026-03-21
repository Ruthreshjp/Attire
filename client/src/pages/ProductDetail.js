import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import TryOnModal from '../components/TryOnModal';
import useScrollAnimation from '../utils/useScrollAnimation';
import { useNotification } from '../context/NotificationContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { showAlert } = useNotification();
    useScrollAnimation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [addedToCart, setAddedToCart] = useState(false);
    const [isTryOnOpen, setIsTryOnOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
                const data = await response.json();
                if (data.success) {
                    setProduct(data.product);
                    // if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
                    if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0].name);

                    // Track Recently Viewed
                    let viewedIds = [];
                    try {
                        const storedViewed = localStorage.getItem('recentlyViewed');
                        if (storedViewed && storedViewed !== 'undefined') {
                            viewedIds = JSON.parse(storedViewed);
                        }
                    } catch (e) {
                        console.error("Error parsing recentlyViewed:", e);
                    }
                    const updatedViewed = [data.product._id, ...viewedIds.filter(vId => vId !== data.product._id)].slice(0, 10);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!selectedSize) {
            showAlert('Please specify your desired size before adding to cart.');
            return;
        }
        if (!selectedColor) {
            showAlert('Please select a color finish.');
            return;
        }
        addToCart(product, selectedSize, selectedColor);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            showAlert('Please specify your desired size before purchasing.');
            return;
        }
        if (!selectedColor) {
            showAlert('Please select a color finish.');
            return;
        }
        addToCart(product, selectedSize, selectedColor);
        navigate('/cart');
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <div className="spinner"></div>
        </div>
    );

    if (error || !product) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem' }}>{error || 'Not Found'}</h2>
            <Link to="/products" style={{ marginTop: '20px', color: '#c5a059', fontWeight: 800 }}>Back to Collections</Link>
        </div>
    );

    const price = (product.isSpecialOffer ? product.price || product.originalPrice : (product.specialPrice || product.price)) || 0;
    const originalPrice = product.originalPrice || product.price;
    const hasDiscount = originalPrice && originalPrice > price && !product.isSpecialOffer;
    
    const colorImages = product.colors?.find(c => c.name === selectedColor)?.images;
    const currentImages = (colorImages && colorImages.length > 0) ? colorImages : (product.images || []);

    const getFullImgUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/800x1000?text=No+Image';
        // Handle object cases (e.g., if url is {url: "..."})
        const actualUrl = typeof url === 'string' ? url : (url.url || '');
        if (!actualUrl || typeof actualUrl !== 'string') return 'https://via.placeholder.com/800x1000?text=No+Image';
        
        if (actualUrl.startsWith('http') || actualUrl.startsWith('data:')) return actualUrl;
        return `${process.env.REACT_APP_API_URL}/${actualUrl}`;
    };

    return (
        <div className="product-page">
            <Navbar />
            
            <div className="product-layout">
                {/* ── IMAGES PANEL ── */}
                <div className="product-visuals anim from-left">
                    <div className="main-display">
                        <img 
                            src={getFullImgUrl(currentImages[selectedImage])} 
                            alt={product.name} 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x1000?text=Error+Loading'; }}
                        />
                        <button 
                            className={`wish-trigger ${isWishlisted(product._id) ? 'active' : ''}`}
                            onClick={() => toggleWishlist(product)}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted(product._id) ? "currentColor" : "none"}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>
                    </div>
                    <div className="thumb-reel">
                        {currentImages.map((img, i) => (
                            <div 
                                key={i} 
                                className={`thumb ${selectedImage === i ? 'active' : ''}`}
                                onClick={() => setSelectedImage(i)}
                            >
                                <img src={getFullImgUrl(img)} alt="" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── INFO PANEL ── */}
                <div className="product-details anim from-right">
                    <div className="details-header">
                        <p className="category-label">{product.category}</p>
                        <h1 className="product-name">{product.name}</h1>
                        <div className="price-tag">
                            <div className="p-vessel">
                                <span className="current">₹{price.toLocaleString('en-IN')}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="original">₹{originalPrice.toLocaleString('en-IN')}</span>
                                        <span className="sale-badge">-{Math.round(((originalPrice - price) / originalPrice) * 100)}%</span>
                                    </>
                                )}
                            </div>
                            {product.couponCode && (
                                <div className="detail-promo-badge">
                                    <span className="p-icon">🏷️</span>
                                    <span>Use code <strong>{product.couponCode}</strong> for extra <strong>{product.extraDiscount || Math.round(((price - (product.specialPrice || price * 0.9)) / price) * 100)}%</strong> discount</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="selectors">
                        {/* Colors */}
                        <div className="selector-group">
                            <label>Finish / Color</label>
                            <div className="color-grid">
                                {product.colors?.map(color => (
                                    <button 
                                        key={color.name}
                                        className={`color-pill ${selectedColor === color.name ? 'active' : ''}`}
                                        onClick={() => { setSelectedColor(color.name); setSelectedImage(0); }}
                                    >
                                        <span className="c-dot" style={{ background: color.hexCode }} />
                                        {color.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div className="selector-group">
                            <label>Size / Fit</label>
                            <div className="size-grid">
                                {product.sizes?.map(size => (
                                    <button 
                                        key={size}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="quick-stats">
                        <div className="stat">
                            <span className="label">Stock Status</span>
                            <span className={`value ${product.stock < 10 ? 'low' : ''}`}>
                                {product.stock > 0 ? `${product.stock} Units Left` : 'Sold Out'}
                            </span>
                        </div>
                        <div className="stat">
                            <span className="label">Orders</span>
                            <span className="value">{product.sold || 0}+ Pieces Sold</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="action-stack">
                        <button className="try-on-trigger" onClick={() => setIsTryOnOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
                                <path d="M9 10v10M15 10v10" />
                            </svg>
                            Explore Virtual Try-On
                        </button>
                        
                        <div className="buy-btns">
                            <button 
                                className={`add-cart-btn ${addedToCart ? 'success' : ''}`}
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                {addedToCart ? 'Item Added' : 'Add to Cart'}
                            </button>
                            <button className="buy-now-btn" onClick={handleBuyNow} disabled={product.stock <= 0}>
                                Purchase Now
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Tabs (Simplified) */}
                    <div className="product-accordion">
                        <div className="acc-item">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>
                        <div className="acc-item">
                            <h3>Specifications</h3>
                            <ul className="spec-list">
                                <li>Artisanal Weave</li>
                                <li>Sustainable Sourcing</li>
                                <li>Signature ATTIRE Fit</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── REVIEWS & RATINGS SECTION ── */}
            <section className="product-reviews-section anim from-bottom">
                 <div className="reviews-container">
                     <div className="reviews-sidebar">
                         <div className="rating-summary">
                             <h2>Registry & Feedback</h2>
                             <div className="big-rating">
                                 <span className="num">4.9</span>
                                 <div className="stars">★★★★★</div>
                                 <span className="total">Based on 128 Reviews</span>
                             </div>
                             <div className="rating-bars">
                                 {[5,4,3,2,1].map(s => (
                                     <div key={s} className="r-bar">
                                         <span>{s}★</span>
                                         <div className="bar-bg"><div className="bar-fill" style={{ width: s === 5 ? '85%' : s === 4 ? '12%' : '1%' }} /></div>
                                         <span>{s === 5 ? '109' : s === 4 ? '15' : '2'}</span>
                                     </div>
                                 ))}
                             </div>
                             <button className="write-review-btn">Share Your Experience</button>
                         </div>
                     </div>

                     <div className="reviews-list">
                         <div className="list-header">
                            <h3>Verified Acquisitions</h3>
                            <div className="list-sort">
                                Sort by: <strong>Newest First</strong>
                            </div>
                         </div>

                         <div className="reviews-stack">
                             {[
                                 {
                                     user: "Liam V.",
                                     rating: 5,
                                     date: "Oct 12, 2024",
                                     comment: "The cut and fabric quality are beyond expectations. It feels like a bespoke piece from a luxury house. Highly recommended for those who appreciate understated elegance.",
                                     images: ["https://images.unsplash.com/photo-1594932224011-046644265cc2?w=400&q=80"]
                                 },
                                 {
                                     user: "Sophia M.",
                                     rating: 4,
                                     date: "Sept 28, 2024",
                                     comment: "Excellent fit. The gold accents are subtle but add that premium touch. Shipping took a bit longer than expected, but the item itself is perfect.",
                                     images: []
                                 }
                             ].map((rev, i) => (
                                 <div key={i} className="review-vessel anim fade">
                                     <div className="rev-head">
                                         <div className="rev-user">
                                             <div className="u-avatar">{rev.user[0]}</div>
                                             <div>
                                                 <strong>{rev.user}</strong>
                                                 <span>Verified Purchase • {rev.date}</span>
                                             </div>
                                         </div>
                                         <div className="rev-stars">{"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}</div>
                                     </div>
                                     <p className="rev-comment">{rev.comment}</p>
                                     {rev.images.length > 0 && (
                                         <div className="rev-images">
                                             {rev.images.map((img, idx) => (
                                                 <img key={idx} src={img} alt="User upload" />
                                             ))}
                                         </div>
                                     )}
                                     <div className="rev-footer">
                                         <button>Helpful</button>
                                         <button>Report</button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <button className="load-more-reviews">Load More Reviews</button>
                     </div>
                 </div>
            </section>

            {isTryOnOpen && (
                <TryOnModal 
                    isOpen={isTryOnOpen} 
                    onClose={() => setIsTryOnOpen(false)} 
                    product={product} 
                />
            )}

            <style>{`
                .product-page { padding-top: 100px; background: #fff; min-height: 100vh; }
                .product-layout { display: flex; gap: 80px; padding: 0 8%; margin-bottom: 100px; }
                
                .product-visuals { flex: 1.2; position: sticky; top: 120px; align-self: flex-start; }
                .main-display { position: relative; aspect-ratio: 1/1; overflow: hidden; background: #f9f9f9; }
                .main-display img { width: 100%; height: 100%; object-fit: cover; }
                .wish-trigger { 
                    position: absolute; top: 30px; right: 30px; width: 50px; height: 50px; 
                    border-radius: 50%; border: none; background: #fff; color: #000;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08); transition: transform 0.3s;
                }
                .wish-trigger:hover { transform: scale(1.1); }
                .wish-trigger.active { color: #c5a059; }

                .thumb-reel { display: flex; gap: 15px; margin-top: 20px; overflow-x: auto; padding-bottom: 5px; }
                .thumb { 
                    width: 90px; height: 90px; flex-shrink: 0; cursor: pointer; 
                    opacity: 0.5; transition: opacity 0.3s; border: 1px solid transparent;
                }
                .thumb.active { opacity: 1; border-color: #000; }
                .thumb img { width: 100%; height: 100%; object-fit: cover; }

                .product-details { flex: 1.2; }
                .category-label { font-size: 0.7rem; letter-spacing: 4px; text-transform: uppercase; color: #c5a059; font-weight: 700; margin-bottom: 15px; }
                .product-name { font-family: 'Playfair Display', serif; font-size: 3.5rem; line-height: 1.1; margin-bottom: 24px; color: #000; }
                .price-tag { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
                .p-vessel { display: flex; align-items: baseline; gap: 15px; }
                .price-tag .current { font-size: 2.2rem; font-weight: 700; color: #000; }
                .price-tag .original { color: #aaa; text-decoration: line-through; font-size: 1.1rem; }
                .sale-badge { background: #000; color: #c5a059; padding: 4px 10px; font-size: 0.75rem; font-weight: 800; }
                
                .detail-promo-badge {
                    display: inline-flex; align-items: center; gap: 10px;
                    padding: 10px 16px; background: rgba(197,160,89,0.08);
                    border: 1px solid rgba(197,160,89,0.15); border-radius: 4px;
                    color: var(--gold-dark); font-size: 0.8rem; font-weight: 600;
                }
                .detail-promo-badge strong { color: #000; font-weight: 800; }

                .selector-group { margin-bottom: 35px; }
                .selector-group label { display: block; font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; font-weight: 800; margin-bottom: 18px; color: #888; }
                .color-grid { display: flex; flex-wrap: wrap; gap: 12px; }
                .color-pill { 
                    display: flex; align-items: center; gap: 10px; padding: 10px 20px; 
                    background: #f5f5f5; border: 1px solid transparent; font-size: 0.85rem; font-weight: 600;
                    transition: all 0.3s; cursor: pointer;
                }
                .color-pill.active { background: #000; color: #fff; border-color: #000; }
                .c-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }
                
                .size-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
                .size-btn { 
                    padding: 15px 0; background: #fff; border: 1px solid #eee; 
                    font-size: 0.9rem; font-weight: 700; transition: all 0.3s; cursor: pointer;
                }
                .size-btn:hover { border-color: #000; }
                .size-btn.active { background: #000; color: #fff; border-color: #000; }

                .quick-stats { display: flex; gap: 40px; padding: 25px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 40px; }
                .stat .label { display: block; font-size: 0.6rem; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 5px; }
                .stat .value { font-weight: 700; font-size: 0.95rem; color: #000; }
                .stat .value.low { color: #b91c1c; }

                .action-stack { display: flex; flexDirection: column; gap: 15px; margin-bottom: 50px; }
                .try-on-trigger { 
                    display: flex; align-items: center; justify-content: center; gap: 12px;
                    width: 100%; padding: 20px; background: transparent; border: 1px solid #c5a059;
                    color: #c5a059; font-size: 0.75rem; font-weight: 800; letter-spacing: 3px;
                    text-transform: uppercase; transition: all 0.3s; cursor: pointer;
                }
                .try-on-trigger:hover { background: rgba(197,160,89,0.05); }

                .buy-btns { display: flex; gap: 15px; }
                .add-cart-btn { 
                    flex: 1; padding: 22px; background: #000; color: #c5a059; border: none;
                    font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;
                    transition: all 0.3s; cursor: pointer;
                }
                .add-cart-btn:hover { background: #222; }
                .add-cart-btn.success { background: #166534; color: #fff; }
                .buy-now-btn { 
                    flex: 1; padding: 22px; background: #c5a059; color: #000; border: none;
                    font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;
                    transition: all 0.3s; cursor: pointer;
                }
                .buy-now-btn:hover { background: #b08d4a; }

                .product-accordion .acc-item { margin-bottom: 30px; }
                .product-accordion h3 { font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px; color: #000; }
                .product-accordion p { color: #666; font-size: 1rem; line-height: 1.8; }
                .spec-list { padding-left: 20px; margin-top: 10px; }
                .spec-list li { list-style: disc; color: #666; font-size: 0.95rem; margin-bottom: 8px; }

                /* REVIEWS STYLES */
                .product-reviews-section { padding: 100px 8%; background: #fafafa; border-top: 1px solid #eee; }
                .reviews-container { display: flex; gap: 80px; }
                .reviews-sidebar { flex: 0.8; }
                .reviews-list { flex: 2; }
                
                .rating-summary h2 { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 30px; }
                .big-rating { margin-bottom: 40px; }
                .big-rating .num { font-size: 4rem; font-weight: 900; color: #000; line-height: 1; display: block; }
                .big-rating .stars { font-size: 1.4rem; color: #c5a059; margin: 10px 0; }
                .big-rating .total { font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 1px; }
                
                .r-bar { display: flex; align-items: center; gap: 15px; margin-bottom: 12px; font-size: 0.75rem; font-weight: 700; color: #666; }
                .bar-bg { flex: 1; height: 4px; background: #eee; border-radius: 2px; overflow: hidden; }
                .bar-fill { height: 100%; background: #000; }
                
                .write-review-btn { width: 100%; padding: 18px; margin-top: 40px; border: 1px solid #000; background: transparent; color: #000; font-size: 0.7rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
                .write-review-btn:hover { background: #000; color: #c5a059; }

                .list-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #eee; margin-bottom: 40px; }
                .list-header h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; }
                .list-sort { font-size: 0.8rem; color: #666; }
                .list-sort strong { color: #000; }

                .review-vessel { padding-bottom: 40px; border-bottom: 1px solid #eee; margin-bottom: 40px; }
                .rev-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .rev-user { display: flex; gap: 15px; align-items: center; }
                .u-avatar { width: 45px; height: 45px; background: #000; color: #c5a059; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 800; font-size: 1.2rem; }
                .rev-user strong { display: block; font-size: 1rem; }
                .rev-user span { font-size: 0.75rem; color: #999; }
                .rev-stars { color: #c5a059; font-size: 1.1rem; }
                .rev-comment { font-size: 1.1rem; line-height: 1.7; color: #444; margin-bottom: 25px; }
                .rev-images { display: flex; gap: 15px; margin-bottom: 25px; }
                .rev-images img { width: 120px; height: 120px; object-fit: cover; border-radius: 4px; }
                .rev-footer { display: flex; gap: 20px; }
                .rev-footer button { background: none; font-size: 0.75rem; font-weight: 700; color: #aaa; }
                .rev-footer button:hover { color: #000; text-decoration: underline; }

                .load-more-reviews { width: 100%; padding: 20px; background: #f0f0f0; border: none; font-size: 0.7rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #666; }
                .load-more-reviews:hover { background: #e8e8e8; color: #000; }

                @media(max-width: 1024px) {
                    .reviews-container { flex-direction: column; gap: 60px; }
                    .product-layout { flex-direction: column; gap: 50px; }
                    .product-visuals { position: relative; top: 0; }
                    .product-name { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;
