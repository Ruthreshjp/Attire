import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import './Orders.css';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

const STATUS_CLASS = (s) => {
    if (!s) return '';
    s = s.toLowerCase();
    if (s === 'cancelled') return 'cancelled';
    if (s === 'delivered' || s === 'processed') return 'delivered';
    if (s === 'shipped') return 'shipped';
    if (s === 'returned') return 'returned';
    if (s === 'return_pending') return 'return_pending';
    return 'pending';
};

const COURIER_ADDRESS = `Attire The complete mens wear, 186, Erode main Road, Near soorya hospital, Tiruchengode - 637211 phone: 8838722957`;

const MyOrders = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const { showAlert } = useNotification();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelForm, setCancelForm] = useState({ accountName: '', accountNumber: '', ifscCode: '', reason: '' });
    const [returnForm, setReturnForm] = useState({ accountName: '', accountNumber: '', ifscCode: '', reason: '' });
    const [isCancelling, setIsCancelling] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    // Find unique previous bank details from history
    const bankHistory = Array.from(new Set(orders
        .filter(o => o.refundDetails?.accountNumber)
        .map(o => JSON.stringify({
            accountName: o.refundDetails.accountName,
            accountNumber: o.refundDetails.accountNumber,
            ifscCode: o.refundDetails.ifscCode
        }))
    )).map(s => JSON.parse(s));

    const fillDetails = (type, details) => {
        if (type === 'cancel') setCancelForm(prev => ({ ...prev, ...details }));
        if (type === 'return') setReturnForm(prev => ({ ...prev, ...details }));
    };

    const canCancel = (date) => {
        const diffDays = Math.ceil(Math.abs(new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
        return diffDays <= 2;
    };

    const handleCancelOrder = async (orderId) => {
        if (!cancelForm.accountName || !cancelForm.accountNumber || !cancelForm.ifscCode || !cancelForm.reason) {
            showAlert('Please fill all bank details and provide a reason'); return;
        }
        try {
            const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/cancel`, cancelForm, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.data.success) {
                setOrders(orders.map(o => o._id === orderId ? res.data.order : o));
                showAlert(res.data.message, 'success', () => {
                    setIsCancelling(false);
                    setSelectedOrder(null);
                });
            }
        } catch (err) {
            showAlert(err.response?.data?.message || 'Error cancelling order', 'error');
        }
    };

    const handleReturnOrder = async (orderId) => {
        if (!returnForm.accountName || !returnForm.accountNumber || !returnForm.ifscCode || !returnForm.reason) {
            showAlert('Please fill all bank details and provide a reason'); return;
        }
        try {
            const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/return`, returnForm, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.data.success) {
                setOrders(orders.map(o => o._id === orderId ? res.data.order : o));
                showAlert(res.data.message, 'success', () => {
                    setIsReturning(false);
                    setSelectedOrder(null);
                });
            }
        } catch (err) {
            showAlert(err.response?.data?.message || 'Error initiating return', 'error');
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (isAuthenticated) {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    if (res.data.success) setOrders(res.data.orders);
                } catch (err) { console.error(err); }
                finally { setLoading(false); }
            } else { setLoading(false); }
        };
        fetchOrders();
    }, [isAuthenticated]);

    const filteredOrders = activeFilter === 'All' ? orders
        : orders.filter(o => {
            if (activeFilter === 'Cancelled') return o.orderStatus === 'cancelled';
            if (activeFilter === 'Confirmed') return o.orderStatus !== 'cancelled' && o.orderStatus !== 'returned' && o.orderStatus !== 'return_pending';
            if (activeFilter === 'Returned') return o.orderStatus === 'returned' || o.orderStatus === 'return_pending';
            return true;
        });

    if (!user) return (
        <div style={{ paddingTop: '80px' }}><Navbar />
            <div className="loading-container"><p style={{ color: '#aaa', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Please login to view your orders</p></div>
        </div>
    );
    if (loading) return (
        <div style={{ paddingTop: '80px' }}><Navbar />
            <div className="loading-container"><div className="loading-spinner" /></div>
        </div>
    );

    /* ── ORDER DETAIL VIEW ── */
    if (selectedOrder) return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-header-band">
                <p className="eyebrow">Order Detail</p>
                <h1>Order #{selectedOrder.orderNumber}</h1>
            </div>
            <div style={{ padding: '40px 8%', maxWidth: '900px' }}>
                <button className="back-to-list" onClick={() => { setSelectedOrder(null); setIsCancelling(false); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    Back to Orders
                </button>

                {/* Status strip */}
                <div className="order-stats-grid">
                    {[
                        { key: 'Status', val: <span className={`status-pill ${STATUS_CLASS(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span> },
                        { key: 'Placed On', val: new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                        { key: 'Total', val: `₹${selectedOrder.total?.toLocaleString('en-IN')}` },
                        { key: 'Payment', val: selectedOrder.paymentMethod?.toUpperCase() },
                    ].map(({ key, val }) => (
                        <div key={key} className="stat-box">
                            <p className="stat-label">{key}</p>
                            <div className="stat-value">{val}</div>
                        </div>
                    ))}
                </div>

                {/* Items */}
                <div className="order-items-box">
                    <div className="items-header">
                        <h3>Items in this Order</h3>
                    </div>
                    {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="order-item-row" onClick={() => window.location.href = `/product/${item.product}`} style={{ cursor: 'pointer' }}>
                            <img src={item.image} alt={item.name} className="order-item-img" />
                            <div className="order-item-detail" style={{ flex: 1 }}>
                                <h4>{item.name}</h4>
                                <p style={{ marginTop: '4px' }}>
                                    {item.size && <span style={{ marginRight: '12px' }}>Size: {item.size}</span>}
                                    {item.color && <span style={{ marginRight: '12px' }}>Color: {item.color}</span>}
                                    <span>Qty: {item.quantity}</span>
                                </p>
                                <p style={{ marginTop: '6px', fontWeight: 700, color: '#000' }}>₹{item.price?.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cancel Section */}
                {selectedOrder.orderStatus !== 'cancelled' && 
                 selectedOrder.orderStatus !== 'returned' && 
                 selectedOrder.orderStatus !== 'return_pending' && 
                 selectedOrder.orderStatus !== 'delivered' && 
                 selectedOrder.orderStatus !== 'processed' && 
                 canCancel(selectedOrder.createdAt) && (
                    <div className="cancel-order-section">
                        <h4>Cancel This Order</h4>
                        {!isCancelling ? (
                            <button className="cancel-btn-danger" onClick={() => { setIsCancelling(true); setIsReturning(false); }}>Request Cancellation</button>
                        ) : (
                            <>
                                <div className="cancel-warning">
                                    ⚠️ <strong>Important:</strong> A processing fee of <strong>₹50</strong> will be deducted from your refund amount. Please provide details below to proceed.
                                </div>
                                <div className="bank-fields">
                                    {bankHistory.length > 0 && (
                                        <div className="bank-history-vessel" style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                                            <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Select Saved Account</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                                {bankHistory.map((bank, idx) => {
                                                    const isSelected = cancelForm.accountNumber === bank.accountNumber;
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => fillDetails('cancel', bank)}
                                                            style={{ 
                                                                padding: '15px', border: isSelected ? '2px solid #000' : '1px solid #eee', 
                                                                borderRadius: '8px', cursor: 'pointer', background: isSelected ? '#fafafa' : '#fff',
                                                                position: 'relative', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }} />}
                                                                </div>
                                                            </div>
                                                            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{bank.accountName}</p>
                                                            <p style={{ fontSize: '0.75rem', color: '#666' }}>{bank.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                                                            <p style={{ fontSize: '0.7rem', color: '#aaa' }}>{bank.ifscCode}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#bbb' }}>or use a different account below</span>
                                                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Reason for Cancellation <span style={{ color: '#f43f5e' }}>*</span></label>
                                        <textarea 
                                            placeholder="Mandatory: Please tell us why you are cancelling..." 
                                            value={cancelForm.reason} 
                                            onChange={e => setCancelForm({ ...cancelForm, reason: e.target.value })}
                                            style={{ width: '100%', height: '80px', padding: '12px', border: '1px solid #eee', borderRadius: '4px', resize: 'none' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Holder Name</label>
                                        <input type="text" placeholder="Full name" value={cancelForm.accountName} onChange={e => setCancelForm({ ...cancelForm, accountName: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Number</label>
                                        <input type="text" placeholder="Bank account number" value={cancelForm.accountNumber} onChange={e => setCancelForm({ ...cancelForm, accountNumber: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>IFSC Code</label>
                                        <input type="text" placeholder="e.g. SBIN0001234" value={cancelForm.ifscCode} onChange={e => setCancelForm({ ...cancelForm, ifscCode: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button className="cancel-btn-danger" onClick={() => handleCancelOrder(selectedOrder._id)}>Confirm Cancellation</button>
                                    <button className="view-detail-btn" onClick={() => setIsCancelling(false)}>Abort</button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Return Section */}
                {(selectedOrder.orderStatus === 'delivered' || selectedOrder.orderStatus === 'processed') && (
                    <div className="cancel-order-section" style={{ borderColor: '#c5a059' }}>
                        <h4 style={{ color: '#c5a059' }}>Return Product</h4>
                        {!isReturning ? (
                            <button className="view-detail-btn" style={{ background: '#000', color: '#c5a059', border: 'none' }} onClick={() => { setIsReturning(true); setIsCancelling(false); }}>Initiate Return</button>
                        ) : (
                            <>
                                <div className="cancel-warning" style={{ background: '#fdfaf3', borderLeftColor: '#c5a059', color: '#8a6d3b' }}>
                                    💡 <strong>Return Policy:</strong> Kindly courier the product to:<br/>
                                    <strong>{COURIER_ADDRESS}</strong><br/>
                                    Your amount will be refunded after we receive the product and completion of quality checks.
                                </div>
                                <div className="bank-fields">
                                    {bankHistory.length > 0 && (
                                        <div className="bank-history-vessel" style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                                            <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Select Saved Account</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                                {bankHistory.map((bank, idx) => {
                                                    const isSelected = returnForm.accountNumber === bank.accountNumber;
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => fillDetails('return', bank)}
                                                            style={{ 
                                                                padding: '15px', border: isSelected ? '2px solid #c5a059' : '1px solid #eee', 
                                                                borderRadius: '8px', cursor: 'pointer', background: isSelected ? '#fffdf7' : '#fff',
                                                                position: 'relative', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c5a059' }} />}
                                                                </div>
                                                            </div>
                                                            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{bank.accountName}</p>
                                                            <p style={{ fontSize: '0.75rem', color: '#666' }}>{bank.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                                                            <p style={{ fontSize: '0.7rem', color: '#aaa' }}>{bank.ifscCode}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#bbb' }}>or use a different account below</span>
                                                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Reason for Return <span style={{ color: '#f43f5e' }}>*</span></label>
                                        <textarea 
                                            placeholder="Mandatory: Please tell us why you are returning this product..." 
                                            value={returnForm.reason} 
                                            onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                                            style={{ width: '100%', height: '80px', padding: '12px', border: '1px solid #eee', borderRadius: '4px', resize: 'none' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Holder Name</label>
                                        <input type="text" placeholder="Full name" value={returnForm.accountName} onChange={e => setReturnForm({ ...returnForm, accountName: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Number</label>
                                        <input type="text" placeholder="Bank account number" value={returnForm.accountNumber} onChange={e => setReturnForm({ ...returnForm, accountNumber: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>IFSC Code</label>
                                        <input type="text" placeholder="e.g. SBIN0001234" value={returnForm.ifscCode} onChange={e => setReturnForm({ ...returnForm, ifscCode: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button className="view-detail-btn" style={{ background: '#000', color: '#c5a059', border: 'none' }} onClick={() => handleReturnOrder(selectedOrder._id)}>Confirm Return</button>
                                    <button className="view-detail-btn" onClick={() => setIsReturning(false)}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Cancelled / Returned Notice */}
                {(selectedOrder.orderStatus === 'cancelled' || selectedOrder.orderStatus === 'returned' || selectedOrder.orderStatus === 'return_pending') && (
                    <div style={{ padding: '40px', background: '#fafafa', border: '1px solid #eee' }}>
                        <h4 style={{ color: '#000', marginBottom: '20px', fontFamily: 'Playfair Display, serif', fontSize: '1.4rem' }}>
                            {selectedOrder.orderStatus === 'cancelled' ? 'Refund Repository' : 'Return Intelligence'}
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                            <div>
                                <p style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', fontWeight: 800, marginBottom: '8px' }}>Status</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className={`status-pill ${selectedOrder.refundDetails?.refundStatus || 'none'}`}>
                                        {selectedOrder.refundDetails?.refundStatus === 'none' ? 'Pending Clearance' 
                                         : selectedOrder.refundDetails?.refundStatus === 'processed' ? 'Refunded'
                                         : selectedOrder.refundDetails?.refundStatus === 'processing' ? 'Processing'
                                         : selectedOrder.refundDetails?.refundStatus === 'initiated' ? 'Refund Initiated'
                                         : 'Pending'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', fontWeight: 800, marginBottom: '8px' }}>Recovery Amount</p>
                                <p style={{ fontWeight: 900, fontSize: '1.4rem', color: '#c5a059' }}>
                                    ₹{selectedOrder.refundDetails?.refundAmount?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {selectedOrder.refundDetails?.adminComment && (
                            <div style={{ marginBottom: '30px', padding: '20px', background: '#fdfaf3', border: '1px solid #f1e4c7', borderRadius: '4px' }}>
                                <p style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#8a6d3b', fontWeight: 800, marginBottom: '8px' }}>Admin Comments</p>
                                <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.4' }}>{selectedOrder.refundDetails.adminComment}</p>
                            </div>
                        )}

                        {selectedOrder.refundDetails?.refundStatus !== 'none' && (
                            <div className="bank-details-card" style={{ background: '#fff', border: '1px solid #eee', padding: '24px', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', fontWeight: 800, marginBottom: '16px' }}>Target Account Intelligence</p>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Holder</span><strong>{selectedOrder.refundDetails?.accountName}</strong></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>Account</span><strong>{selectedOrder.refundDetails?.accountNumber?.replace(/.(?=.{4})/g, '*')}</strong></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#aaa', fontSize: '0.8rem' }}>IFSC</span><strong>{selectedOrder.refundDetails?.ifscCode}</strong></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    /* ── ORDERS LIST VIEW ── */
    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-header-band">
                <p className="eyebrow">Purchase History</p>
                <h1>My Orders</h1>
            </div>

            <div style={{ padding: '40px 8%' }}>
                {/* Filter pills */}
                <div className="orders-filters">
                    {['All', 'Confirmed', 'Returned', 'Cancelled'].map(f => (
                        <button key={f} className={`filter-pill${activeFilter === f ? ' active' : ''}`} onClick={() => setActiveFilter(f)}>
                            {f}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#aaa', alignSelf: 'center' }}>
                        {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                    </span>
                </div>

                {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1">
                            <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                        </svg>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem' }}>No Orders Found</h3>
                        <p style={{ color: '#aaa' }}>You have no {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} orders yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {filteredOrders.map(order => (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header" onClick={() => setSelectedOrder(order)}>
                                    <div>
                                        <p className="order-id">Order #{order.orderNumber}</p>
                                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <span className={`status-pill ${STATUS_CLASS(order.orderStatus)}`}>{order.orderStatus}</span>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="order-total">₹{order.total?.toLocaleString('en-IN')}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>{order.items?.reduce((s, i) => s + i.quantity, 0)} items</p>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                                {/* Preview images */}
                                <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {order.items?.slice(0, 4).map((item, i) => (
                                        <img key={i} src={item.image} alt={item.name}
                                            style={{ width: '50px', height: '64px', objectFit: 'cover', background: '#f5f5f5' }} />
                                    ))}
                                    {order.items?.length > 4 && (
                                        <div style={{ width: '50px', height: '64px', background: '#fafafa', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#aaa', fontWeight: 700 }}>
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                    <button className="view-detail-btn" style={{ marginTop: 0, marginLeft: 'auto' }} onClick={() => setSelectedOrder(order)}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
