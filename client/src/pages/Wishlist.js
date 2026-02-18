import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist, markSeen } = useWishlist();
    const { addToCart } = useCart();

    useEffect(() => {
        markSeen();
    }, [markSeen]);

    const handleMoveToCart = (item) => {
        addToCart(item);
        removeFromWishlist(item.id);
    };

    return (
        <div className="wishlist-page">
            <Navbar />
            <div className="wishlist-container">
                <h1 className="wishlist-title">My Wishlist ({wishlistItems.length})</h1>

                {wishlistItems.length > 0 ? (
                    <div className="wishlist-grid">
                        {wishlistItems.map(item => (
                            <div key={item.id} className="wishlist-item">
                                <div className="wishlist-image">
                                    <img src={item.image} alt={item.name} />
                                    <button
                                        className="remove-wishlist-btn"
                                        onClick={() => removeFromWishlist(item.id)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <div className="wishlist-details">
                                    <h3>{item.name}</h3>
                                    {item.category && (
                                        <p className="wishlist-category">{item.category}</p>
                                    )}
                                    <div className="price">₹{(item.price || 0).toLocaleString('en-IN')}</div>
                                    <div className={`stock-status ${item.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                        {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                    </div>
                                    <button
                                        className="move-to-cart-btn"
                                        onClick={() => handleMoveToCart(item)}
                                    >
                                        Move to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-wishlist">
                        <div className="empty-wishlist-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love to your wishlist so you don't lose track of them.</p>
                        <button className="start-shopping-btn" onClick={() => navigate('/products')}>
                            Explore Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
