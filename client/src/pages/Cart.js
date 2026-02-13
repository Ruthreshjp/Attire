import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Classic White Shirt',
            price: 3999,
            size: 'L',
            color: 'White',
            image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
            quantity: 1
        },
        {
            id: 2,
            name: 'Slim Fit Denim Jeans',
            price: 5599,
            size: '32',
            color: 'Blue',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
            quantity: 2
        }
    ]);

    const handleQuantityChange = (id, change) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const handleRemoveItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : 150;
    const total = subtotal + shipping;

    return (
        <div className="cart-page">
            <Navbar />
            <div className="cart-container">
                <h1 className="cart-title">Your Cart ({cartItems.length} items)</h1>

                {cartItems.length > 0 ? (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <h3>{item.name}</h3>
                                        <p className="cart-item-meta">Size: {item.size} | Color: {item.color}</p>
                                        <div className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                                        </div>
                                        <button
                                            className="remove-item-btn"
                                            onClick={() => handleRemoveItem(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Order Summary</h2>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <button className="checkout-btn">Proceed to Checkout</button>
                            <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <button className="start-shopping-btn" onClick={() => navigate('/products')}>
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
