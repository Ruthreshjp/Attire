import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { isAuthenticated } = useContext(AuthContext);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    const shipping = cartTotal > 2000 ? 0 : 150;
    const handleApplyCoupon = () => {
        setCouponError('');
        const match = cartItems.find(item => item.couponCode && item.couponCode.toLowerCase() === couponCode.toLowerCase());

        if (match) {
            setAppliedCoupon(couponCode.toLowerCase());
            setCouponCode('');
        } else {
            setCouponError('Invalid promo code');
            setAppliedCoupon(null);
        }
    };

    const discountAmount = cartItems.reduce((acc, item) => {
        if (appliedCoupon && item.couponCode && item.couponCode.toLowerCase() === appliedCoupon) {
            // Use specialPrice difference if available, otherwise fallback to percentage
            if (item.specialPrice && item.specialPrice < item.price) {
                return acc + ((item.price - item.specialPrice) * item.quantity);
            }
            const itemDiscount = item.extraDiscount || item.discount || 0;
            return acc + (item.price * item.quantity * (itemDiscount / 100));
        }
        return acc;
    }, 0);

    const total = cartTotal + shipping - discountAmount;

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            alert('Please login to proceed to checkout');
            navigate('/login');
            return;
        }

        try {
            const orderData = {
                orderItems: cartItems,
                shippingAddress: {
                    street: '123 Default St',
                    city: 'City',
                    state: 'State',
                    zipCode: '123456',
                    country: 'Country'
                },
                paymentMethod: 'cash_on_delivery',
                subtotal: cartTotal,
                tax: 0,
                shippingCost: shipping,
                total: total
            };

            const res = await axios.post('http://localhost:5000/api/orders', orderData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            if (res.data.success) {
                alert('Order placed successfully!');
                await clearCart();
                navigate('/my-orders');
            }
        } catch (err) {
            console.error('Error placing order:', err);
            alert('Failed to place order. Please try again.');
        }
    };

    return (
        <div className="cart-page">
            <Navbar />
            <div className="cart-container">
                <h1 className="cart-title">Your Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</h1>

                {cartItems.length > 0 ? (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.cartKey} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <h3>{item.name}</h3>
                                        {(item.size || item.color) && (
                                            <p className="cart-item-meta">
                                                {item.size && `Size: ${item.size}`}
                                                {item.size && item.color && ' | '}
                                                {item.color && `Color: ${item.color}`}
                                            </p>
                                        )}
                                        <div className="cart-item-price">₹{(item.price || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button onClick={() => updateQuantity(item.cartKey, -1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartKey, 1)}>+</button>
                                        </div>
                                        <button
                                            className="remove-item-btn"
                                            onClick={() => removeFromCart(item.cartKey)}
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
                                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                            </div>

                            {appliedCoupon && (
                                <div className="summary-row discount">
                                    <span>Discount ({appliedCoupon.toUpperCase()})</span>
                                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <div className="promo-code-section">
                                <div className="promo-input-group">
                                    <input
                                        type="text"
                                        placeholder="Enter promo code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button onClick={handleApplyCoupon}>Apply</button>
                                </div>
                                {couponError && <p className="promo-error">{couponError}</p>}
                                {appliedCoupon && <p className="promo-success">Coupon "{appliedCoupon.toUpperCase()}" applied!</p>}
                            </div>

                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
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
