import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            name: 'Classic White Shirt',
            price: 6399,
            image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
            inStock: true
        },
        {
            id: 2,
            name: 'Leather Belt',
            price: 3999,
            image: 'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=600&q=80',
            inStock: false
        }
    ]);

    const handleRemove = (id) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== id));
    };

    const handleAddToCart = (id) => {
        // Assume adding to cart logic here
        console.log(`Add item ${id} to cart`);
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
                                        onClick={() => handleRemove(item.id)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <div className="wishlist-details">
                                    <h3>{item.name}</h3>
                                    <div className="price">₹{item.price.toLocaleString('en-IN')}</div>
                                    <div className={`stock-status ${item.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                                    </div>
                                    <button
                                        className="move-to-cart-btn"
                                        disabled={!item.inStock}
                                        onClick={() => handleAddToCart(item.id)}
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
