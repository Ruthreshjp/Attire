import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user, isAuthenticated } = useContext(AuthContext);

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

    const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'address', 'payment', 'success'
    const [addressHistory, setAddressHistory] = useState([]);
    const [address, setAddress] = useState({
        name: user?.name || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        phone: ''
    });

    // Fetch address history
    React.useEffect(() => {
        const fetchAddressHistory = async () => {
            if (isAuthenticated) {
                try {
                    const res = await axios.get('http://localhost:5000/api/orders', {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    if (res.data.success) {
                        // Extract unique addresses from past orders
                        const addresses = res.data.orders.map(o => o.shippingAddress);
                        const uniqueAddresses = Array.from(new Set(addresses.map(a => JSON.stringify(a)))).map(s => JSON.parse(s));
                        setAddressHistory(uniqueAddresses);
                    }
                } catch (err) {
                    console.error('Error fetching address history:', err);
                }
            }
        };
        fetchAddressHistory();
    }, [isAuthenticated]);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            alert('Please login to proceed to checkout');
            navigate('/login');
            return;
        }
        setCheckoutStep('address');
    };

    const handleConfirmAddress = (e) => {
        e.preventDefault();
        if (!address.street || !address.city || !address.phone) {
            alert('Please fill in the required address fields');
            return;
        }
        setCheckoutStep('payment');
    };

    const handlePayment = async () => {
        try {
            // Ensure amount is an integer and in correct format
            const sanitizedAmount = Math.round(total);
            console.log('Initiating checkout for amount:', sanitizedAmount);

            // 1. Create Razorpay order on backend
            const orderRes = await axios.post('http://localhost:5000/api/payment/create-order',
                { amount: sanitizedAmount },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );

            if (!orderRes.data.success) {
                alert('Order creation failed');
                return;
            }

            const { order } = orderRes.data;

            // 2. Open Razorpay Popup
            const options = {
                key: 'rzp_test_SPnkx43FsWVffJ', // Test Key
                amount: order.amount,
                currency: order.currency,
                name: 'Attire Premium',
                description: 'Order Payment',
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post('http://localhost:5000/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData: {
                                items: cartItems,
                                shippingAddress: address,
                                subtotal: cartTotal,
                                total: total,
                                shippingCost: shipping,
                                tax: 0
                            }
                        }, { headers: { 'x-auth-token': localStorage.getItem('token') } });

                        if (verifyRes.data.success) {
                            // Play success sound
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
                            audio.play().catch(e => console.log("Audio play failed", e));

                            setCheckoutStep('success');
                            clearCart();
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: address.name,
                    email: user?.email || '',
                    contact: address.phone
                },
                theme: {
                    color: "#D4AF37" // Golden color to match theme
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert('Payment failed: ' + response.error.description);
            });
            rzp.open();

        } catch (err) {
            console.error('Checkout error:', err);
            alert('Failed to initiate payment. Please try again.');
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
                                    <Link to={`/product/${item.id}`} className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </Link>
                                    <div className="cart-item-details">
                                        <Link to={`/product/${item.id}`}>
                                            <h3>{item.name}</h3>
                                        </Link>
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
                                            title="Remove from cart"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            {checkoutStep === 'address' && (
                                <div className="checkout-step">
                                    <button className="back-to-cart" onClick={() => setCheckoutStep('cart')}>&larr; Back to Cart</button>
                                    <h3>Shipping Address</h3>

                                    {addressHistory.length > 0 && (
                                        <div className="address-history">
                                            <p className="history-subtitle">Use a previous address:</p>
                                            <div className="history-list">
                                                {addressHistory.map((hist, idx) => (
                                                    <div key={idx} className="history-item" onClick={() => setAddress(hist)}>
                                                        <p><strong>{hist.name}</strong></p>
                                                        <p className="hist-addr">{hist.street}, {hist.city}</p>
                                                        <p className="hist-meta">{hist.zipCode}, {hist.phone}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="or-divider"><span>OR NEW ADDRESS</span></div>
                                        </div>
                                    )}

                                    <form className="address-form" onSubmit={handleConfirmAddress}>
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={address.name}
                                                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Street Address</label>
                                            <input
                                                type="text"
                                                value={address.street}
                                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    value={address.city}
                                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Zip Code</label>
                                                <input
                                                    type="text"
                                                    value={address.zipCode}
                                                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={address.phone}
                                                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="checkout-btn">Continue to Payment</button>
                                    </form>
                                </div>
                            )}

                            {checkoutStep === 'payment' && (
                                <div className="checkout-step">
                                    <button className="back-to-cart" onClick={() => setCheckoutStep('address')}>&larr; Edit Address</button>
                                    <h3>Order Summary</h3>
                                    <div className="payment-summary-card">
                                        <div className="p-section">
                                            <label>DELIVER TO</label>
                                            <p><strong>{address.name}</strong></p>
                                            <p>{address.street}, {address.city}, {address.state} {address.zipCode}</p>
                                            <p>{address.phone}</p>
                                        </div>
                                        <div className="p-divider"></div>
                                        <div className="p-section">
                                            <label>PAYMENT DETAILS</label>
                                            <div className="p-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                                            <div className="p-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                                            <div className="p-row total"><span>Total Payable</span><span>₹{total.toLocaleString()}</span></div>
                                        </div>
                                    </div>
                                    <button onClick={handlePayment} className="pay-now-btn">Pay with Razorpay</button>
                                    <p className="secure-badge">🔒 Secure Payment via SSL & Razorpay</p>
                                </div>
                            )}

                            {checkoutStep === 'success' && (
                                <div className="success-overlay">
                                    <div className="success-content">
                                        <div className="golden-tick-wrapper">
                                            <div className="golden-circle">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h2>Thank You for Ordering!</h2>
                                        <p>Your order has been received successfully.</p>
                                        <button onClick={() => navigate('/my-orders')} className="view-orders-btn">Track My Order</button>
                                        <button onClick={() => navigate('/products')} className="shop-more-btn">Shop More</button>
                                    </div>
                                </div>
                            )}

                            {checkoutStep === 'cart' && (
                                <>
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
                                </>
                            )}
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
            <style>{`
                .checkout-step {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .back-to-cart {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    font-weight: 500;
                    text-align: left;
                    padding: 0;
                    margin-bottom: 10px;
                }
                .address-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .form-group label {
                    font-size: 0.85rem;
                    color: #666;
                    font-weight: 500;
                }
                .form-group input {
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 0.95rem;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .checkout-final-summary {
                    margin-top: 20px;
                    background: #f9f9f9;
                    padding: 15px;
                    border-radius: 8px;
                }
                .pay-now-btn {
                    width: 100%;
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    margin-top: 15px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .pay-now-btn:hover {
                    background: #333;
                }
                .address-history {
                    margin-bottom: 25px;
                    background: #fdfdfd;
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px dashed #ddd;
                }
                .history-subtitle {
                    font-size: 0.8rem;
                    color: #888;
                    margin-bottom: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .history-item {
                    padding: 12px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                }
                .history-item:hover {
                    border-color: #D4AF37;
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1);
                }
                .hist-addr { font-size: 0.9rem; color: #555; margin: 3px 0; }
                .hist-meta { font-size: 0.85rem; color: #888; }
                .or-divider {
                    text-align: center;
                    margin: 15px 0;
                    position: relative;
                }
                .or-divider::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #eee;
                }
                .or-divider span {
                    background: #fdfdfd;
                    padding: 0 10px;
                    font-size: 0.75rem;
                    color: #999;
                    position: relative;
                    font-weight: 700;
                }
                .payment-summary-card {
                    background: #fafafa;
                    border-radius: 12px;
                    border: 1px solid #eee;
                    overflow: hidden;
                }
                .p-section { padding: 15px; }
                .p-section label { font-size: 0.7rem; color: #999; font-weight: 700; display: block; margin-bottom: 8px; }
                .p-section p { font-size: 0.9rem; color: #333; line-height: 1.4; }
                .p-divider { height: 1px; background: #eee; margin: 0 15px; }
                .p-row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px; color: #555; }
                .p-row.total { font-weight: 700; color: #1a1a1a; margin-top: 10px; font-size: 1rem; }
                .secure-badge { text-align: center; font-size: 0.75rem; color: #2e7d32; margin-top: 15px; font-weight: 600; }
                
                /* Success View */
                .success-overlay {
                    text-align: center;
                    padding: 20px 0;
                }
                .golden-tick-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .golden-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: #fffdf2;
                    border: 4px solid #D4AF37;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: circleScale 0.6s ease-out;
                }
                .golden-circle svg {
                    width: 50px;
                    height: 50px;
                    animation: tickDraw 0.5s 0.3s both;
                }
                @keyframes circleScale {
                    0% { transform: scale(0); }
                    80% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @keyframes tickDraw {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .success-content h2 { color: #1a1a1a; margin-bottom: 10px; }
                .success-msg { color: #666; font-size: 0.9rem; margin-bottom: 30px; }
                .success-actions { display: flex; flex-direction: column; gap: 12px; }
                .view-orders-btn {
                    background: #D4AF37;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .shop-more-btn {
                    background: white;
                    color: #1a1a1a;
                    border: 1px solid #1a1a1a;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Cart;
