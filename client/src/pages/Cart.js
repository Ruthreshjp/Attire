import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Cart.css';

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
            if (item.specialPrice && item.specialPrice < item.price) {
                return acc + ((item.price - item.specialPrice) * item.quantity);
            }
            const itemDiscount = item.extraDiscount || item.discount || 0;
            return acc + (item.price * item.quantity * (itemDiscount / 100));
        }
        return acc;
    }, 0);

    const total = cartTotal + shipping - discountAmount;

    const [checkoutStep, setCheckoutStep] = useState('cart'); 
    const [addressHistory, setAddressHistory] = useState([]);
    const [address, setAddress] = useState({
        name: user?.name || '',
        street: '',
        city: '',
        zipCode: '',
        phone: ''
    });

    useEffect(() => {
        const fetchAddressHistory = async () => {
            if (isAuthenticated) {
                try {
                    const res = await axios.get('http://localhost:5000/api/orders', {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    if (res.data.success) {
                        const addresses = res.data.orders.map(o => o.shippingAddress);
                        const uniqueAddresses = Array.from(new Set(addresses.map(a => JSON.stringify(a)))).map(s => JSON.parse(s));
                        setAddressHistory(uniqueAddresses.filter(a => a && a.street));
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
        if (!address.street || !address.city || !address.phone || !address.zipCode) {
            alert('Please fill in all required address fields');
            return;
        }
        setCheckoutStep('payment');
    };

    const handlePayment = async () => {
        try {
            const sanitizedAmount = Math.round(total);
            const orderRes = await axios.post('http://localhost:5000/api/payment/create-order',
                { amount: sanitizedAmount },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );

            if (!orderRes.data.success) {
                alert('Order creation failed');
                return;
            }

            const { order } = orderRes.data;

            const options = {
                key: 'rzp_test_SPnkx43FsWVffJ', 
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
                            new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play().catch(() => {});
                            setCheckoutStep('success');
                            clearCart();
                        }
                    } catch (err) {
                        alert('Payment verification failed.');
                    }
                },
                prefill: {
                    name: address.name,
                    email: user?.email || '',
                    contact: address.phone
                },
                theme: { color: "#D4AF37" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            alert('Failed to initiate payment.');
        }
    };

    return (
        <div className="cart-page">
            <Navbar />
            <div className="cart-container">
                {/* ── Checkout Progress Bar ── */}
                {checkoutStep !== 'cart' && checkoutStep !== 'success' && (
                    <div className="checkout-progress">
                        <div className={`progress-step ${checkoutStep === 'address' ? 'active' : 'completed'}`} onClick={() => setCheckoutStep('cart')}>
                            <span className="step-num">{checkoutStep === 'address' ? '1' : '✓'}</span>
                            <span className="step-label">Cart</span>
                        </div>
                        <div className="progress-line" />
                        <div className={`progress-step ${checkoutStep === 'address' ? 'active' : checkoutStep === 'payment' ? 'active' : 'completed'}`}>
                            <span className="step-num">{checkoutStep === 'payment' ? '✓' : '2'}</span>
                            <span className="step-label">Address</span>
                        </div>
                        <div className="progress-line" />
                        <div className={`progress-step ${checkoutStep === 'payment' ? 'active' : ''}`}>
                            <span className="step-num">3</span>
                            <span className="step-label">Payment</span>
                        </div>
                    </div>
                )}

                <h1 className="cart-title">
                    {checkoutStep === 'cart' ? `Your Cart (${cartItems.length})` : 
                     checkoutStep === 'address' ? 'Shipping Details' : 
                     checkoutStep === 'payment' ? 'Secure Checkout' : ''}
                </h1>

                {cartItems.length > 0 ? (
                    <div className={`cart-content ${checkoutStep !== 'cart' ? 'checkout-active' : ''}`}>
                        <div className="cart-left-col">
                            {checkoutStep === 'cart' ? (
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
                                                <button className="remove-item-btn" onClick={() => removeFromCart(item.cartKey)}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : checkoutStep === 'address' ? (
                                <div className="checkout-address-section">
                                    <h3 className="section-header">Where should we send your order?</h3>
                                    
                                    {addressHistory.length > 0 && (
                                        <div className="address-history">
                                            <p className="history-subtitle">Previous Addresses</p>
                                            <div className="history-grid">
                                                {addressHistory.map((hist, idx) => (
                                                    <div key={idx} className={`history-card ${JSON.stringify(hist) === JSON.stringify(address) ? 'selected' : ''}`} onClick={() => setAddress(hist)}>
                                                        <div className="card-select-icon">
                                                            {JSON.stringify(hist) === JSON.stringify(address) && <span className="dot" />}
                                                        </div>
                                                        <div className="card-info">
                                                            <p className="hist-name"><strong>{hist.name}</strong></p>
                                                            <p className="hist-street">{hist.street}</p>
                                                            <p className="hist-city">{hist.city}, {hist.zipCode}</p>
                                                            <p className="hist-phone">{hist.phone}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="new-address-prompt">
                                                <span>Add a New Address</span>
                                                <div className="line" />
                                            </div>
                                        </div>
                                    )}

                                    <form className="address-form-fancy" onSubmit={handleConfirmAddress}>
                                        <div className="form-group-fancy">
                                            <input type="text" placeholder=" " id="addr-name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} required />
                                            <label htmlFor="addr-name">Full Recipient Name</label>
                                        </div>
                                        <div className="form-group-fancy">
                                            <input type="text" placeholder=" " id="addr-street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
                                            <label htmlFor="addr-street">Street, House No, Locality</label>
                                        </div>
                                        <div className="form-row-fancy">
                                            <div className="form-group-fancy">
                                                <input type="text" placeholder=" " id="addr-city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
                                                <label htmlFor="addr-city">City</label>
                                            </div>
                                            <div className="form-group-fancy">
                                                <input type="text" placeholder=" " id="addr-zip" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} required />
                                                <label htmlFor="addr-zip">Pincode</label>
                                            </div>
                                        </div>
                                        <div className="form-group-fancy">
                                            <input type="tel" placeholder=" " id="addr-phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required />
                                            <label htmlFor="addr-phone">Mobile Number</label>
                                        </div>
                                        <div className="checkout-btns-group">
                                            <button type="button" className="back-btn" onClick={() => setCheckoutStep('cart')}>Modify Cart</button>
                                            <button type="submit" className="continue-btn">Save & Proceed</button>
                                        </div>
                                    </form>
                                </div>
                            ) : checkoutStep === 'payment' ? (
                                <div className="checkout-payment-section">
                                    <h3 className="section-header">Last Step: Payment Verification</h3>
                                    
                                    <div className="order-final-preview">
                                        <div className="preview-card">
                                            <div className="preview-header">
                                                <h4>Shipping Summary</h4>
                                                <button onClick={() => setCheckoutStep('address')}>Edit</button>
                                            </div>
                                            <div className="preview-body">
                                                <p><strong>{address.name}</strong></p>
                                                <p>{address.street}, {address.city}, {address.zipCode}</p>
                                                <p>Contact: {address.phone}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="preview-card">
                                            <div className="preview-header">
                                                <h4>Items ({cartItems.length})</h4>
                                                <button onClick={() => setCheckoutStep('cart')}>Edit</button>
                                            </div>
                                            <div className="preview-items-mini">
                                                {cartItems.map(item => (
                                                    <div key={item.cartKey} className="item-mini">
                                                        <img src={item.image} alt="" />
                                                        <div className="item-mini-info">
                                                            <p className="name">{item.name}</p>
                                                            <p className="price">₹{item.price.toLocaleString()} x {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="payment-guarantee">
                                        <div className="guarantee-icon">🛡️</div>
                                        <div className="guarantee-text">
                                            <p><strong>Secure Checkout Guaranteed</strong></p>
                                            <p>Your transaction is encrypted with 256-bit SSL technology. Payment via Razorpay.</p>
                                        </div>
                                    </div>

                                    <button onClick={handlePayment} className="finalize-payment-btn">
                                        <div className="btn-shine" />
                                        <span>Confirm Order & Pay ₹{total.toLocaleString()}</span>
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="cart-summary-col">
                            <div className="summary-card-premium">
                                <h2>Order Summary</h2>
                                <div className="summary-details">
                                    <div className="summary-row"><span>Cart Value</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                                    <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span></div>
                                    {appliedCoupon && (
                                        <div className="summary-row discount"><span>Reward ({appliedCoupon.toUpperCase()})</span><span>-₹{discountAmount.toLocaleString('en-IN')}</span></div>
                                    )}
                                    {checkoutStep === 'cart' && (
                                        <div className="promo-section-fancy">
                                            <div className="promo-field">
                                                <input type="text" placeholder="Promo Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                                <button onClick={handleApplyCoupon}>Apply</button>
                                            </div>
                                            {couponError && <p className="p-err">{couponError}</p>}
                                            {appliedCoupon && <p className="p-succ">Coupon Applied!</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="summary-total-premium">
                                    <div className="total-row"><span>Grand Total</span><span className="total-val">₹{total.toLocaleString('en-IN')}</span></div>
                                    <p className="tax-incl">Inclusive of all taxes</p>
                                </div>

                                {checkoutStep === 'cart' && (
                                    <div className="cart-actions-sticky">
                                        <button className="primary-checkout-btn" onClick={handleCheckout}>Checkout Now</button>
                                        <button className="secondary-shop-btn" onClick={() => navigate('/products')}>Continue Browsing</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : checkoutStep === 'success' ? (
                    <div className="order-success-canvas">
                        <div className="success-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                        <h2 className="success-title">Order Placed Successfully!</h2>
                        <p className="success-subtitle">A confirmation email has been sent.</p>
                        <div className="success-actions">
                            <button onClick={() => navigate('/my-orders')} className="track-order-btn">Track Order</button>
                            <button onClick={() => navigate('/')} className="back-home-btn">Return Home</button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart-aesthetic">
                        <div className="empty-visual"><svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></div>
                        <h2>Your wardrobe is empty</h2>
                        <button className="explore-btn" onClick={() => navigate('/products')}>Start Exploring</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
