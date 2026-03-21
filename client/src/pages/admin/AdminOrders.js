import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';

const AdminOrders = () => {
    const { showAlert, showConfirm } = useNotification();
    const [activeFilter, setActiveFilter] = useState('All');
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
    const [adminComment, setAdminComment] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/orders`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (err) {
            console.error('Error fetching admin orders:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDeliver = (orderId) => {
        showConfirm('Are you sure the product is delivered?', async () => {
            try {
                const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/orders/${orderId}/status`, {
                    status: 'processed' 
                }, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    showAlert('Order status updated successfully!', 'success');
                    fetchOrders();
                }
            } catch (err) {
                console.error('Delivery Status Error:', err);
                showAlert('Failed to update delivery status.', 'error');
            }
        });
    };

    const handleReturnAction = async (orderId, action) => {
        try {
            const order = orders.find(o => o._id === orderId || o.id === orderId);
            const isCancelled = order?.orderStatus === 'cancelled';
            
            let url = `${process.env.REACT_APP_API_URL}/api/admin/orders/${orderId}/${isCancelled ? 'refund' : 'return-action'}`;
            let data = isCancelled ? { status: action === 'refund' ? 'processed' : 'processing' } : { action, comment: adminComment };
            
            // If it's return-action, we always send comment. If it's refund (cancelled), we might want to add comment support later but for now we'll just follow current API.
            // Wait, let's keep it simple. If isCancelled, use /refund.
            
            const res = await axios.put(url, data, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            if (res.data.success) {
                // Close modal immediately
                setSelectedReturnOrder(null);
                setAdminComment('');
                
                // Show success alert
                showAlert(`Order Transaction successfully updated: #${order?.orderNumber || order?.id || 'N/A'}`, 'success');
                
                // Refresh list
                fetchOrders();
            }
        } catch (err) {
            console.error('Action Error:', err);
            showAlert('Failed to process action.', 'error');
        }
    };

    const filteredOrders = orders.filter(order => {
        // Search Filter
        const matchesSearch = !searchTerm || 
            (order.orderNumber || order.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        // Status Filter
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Confirmed') return order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned' && order.orderStatus !== 'return_pending';
        if (activeFilter === 'Cancelled') return order.orderStatus === 'cancelled';
        if (activeFilter === 'Delivered') return order.orderStatus === 'processed' || order.orderStatus === 'delivered';
        if (activeFilter === 'Returned') return order.orderStatus === 'returned' || order.orderStatus === 'return_pending';
        
        return true;
    });

    const filters = ['All', 'Confirmed', 'Delivered', 'Returned', 'Cancelled'];

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-viewport">
                <header className="viewport-header">
                    <div className="title-stack">
                        <h1>Order Intelligence</h1>
                        <p>Track and process customer acquisitions</p>
                    </div>
                </header>

                <div className="collection-intel-grid">
                    <div className="intel-card gold">
                        <span className="card-label">Gross Intake</span>
                        <h2 className="card-value">₹{orders.reduce((acc, o) => acc + (o.total || o.amount || 0), 0).toLocaleString()}</h2>
                        <div className="card-trend">Total Volume</div>
                    </div>
                    <div className="intel-card ink">
                        <span className="card-label">Returns/Refunds</span>
                        <h2 className="card-value">{orders.filter(o => o.orderStatus === 'returned' || o.orderStatus === 'return_pending').length}</h2>
                        <div className="card-trend">Cycle Reversals</div>
                    </div>
                    <div className="intel-card rose">
                        <span className="card-label">Active Cycles</span>
                        <h2 className="card-value">{orders.filter(o => o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered' && o.orderStatus !== 'processed' && o.orderStatus !== 'returned' && o.orderStatus !== 'return_pending').length}</h2>
                        <div className="card-trend">In-process flow</div>
                    </div>
                </div>

                <div className="order-filters-bar-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {filters.map(filter => (
                            <button
                                key={filter}
                                className={`filter-pill-v2 ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                                <span className="pill-count">
                                    {filter === 'All' ? orders.length : orders.filter(o => {
                                        if (filter === 'Confirmed') return o.orderStatus !== 'cancelled' && o.orderStatus !== 'returned' && o.orderStatus !== 'return_pending';
                                        if (filter === 'Cancelled') return o.orderStatus === 'cancelled';
                                        if (filter === 'Delivered') return o.orderStatus === 'processed' || o.orderStatus === 'delivered';
                                        if (filter === 'Returned') return o.orderStatus === 'returned' || o.orderStatus === 'return_pending';
                                        return true;
                                    }).length}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="search-box-v2" style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search Order ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '12px 40px 12px 18px',
                                background: '#f5f5f5',
                                border: '1px solid #eee',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                color: '#000',
                                width: '300px'
                            }}
                        />
                        <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>
                </div>

                <div className="listing-intelligence-vessel">
                    <div className="luxury-table-wrapper-v2">
                        <table className="luxury-table-v2">
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Client</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Timeline</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="6" className="empty-row-v2">No records found for the selected cycle.</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order._id || order.id}>
                                            <td><span className="artifact-meta"><strong>#{order.orderNumber || order.id}</strong></span></td>
                                            <td>
                                                <div className="artifact-meta">
                                                    <strong>{order.user?.name || order.user || 'Guest'}</strong>
                                                    <span>{order.paymentMethod || 'Manual'}</span>
                                                </div>
                                            </td>
                                            <td><strong className="sale-new">₹{(order.total || order.amount || 0).toLocaleString()}</strong></td>
                                            <td><span className={`pill ${order.orderStatus?.toLowerCase() || order.status?.toLowerCase()}`}>{order.orderStatus || order.status}</span></td>
                                            <td>{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-stack-mini" style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="hub-btn edit" onClick={() => {
                                                        if (order.orderStatus === 'return_pending' || order.orderStatus === 'returned' || order.orderStatus === 'cancelled') {
                                                            setSelectedReturnOrder(order);
                                                            setAdminComment(order.refundDetails?.adminComment || '');
                                                        }
                                                    }}>View</button>
                                                    {(order.orderStatus !== 'cancelled' && order.orderStatus !== 'processed' && order.orderStatus !== 'delivered' && order.orderStatus !== 'returned' && order.orderStatus !== 'return_pending') && (
                                                        <button 
                                                            className="hub-btn deliver" 
                                                            style={{ background: '#c5a059', color: '#000', fontWeight: 700 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeliver(order._id || order.id);
                                                            }}
                                                        >
                                                            Delivered
                                                        </button>
                                                    )}
                                                    {(order.orderStatus === 'return_pending') && (
                                                        <button 
                                                            className="hub-btn deliver" 
                                                            style={{ background: '#000', color: '#c5a059', fontWeight: 700 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedReturnOrder(order);
                                                                setAdminComment(order.refundDetails?.adminComment || '');
                                                            }}
                                                        >
                                                            Process Return
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Return Processing Overlay */}
                {selectedReturnOrder && (
                    <div className="admin-overlay" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div className="return-modal" style={{
                            background: '#fff', width: '90%', maxWidth: '600px', padding: '40px', borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <div>
                                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>Return Strategy</h2>
                                    <p style={{ color: '#aaa', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Processing Order #{selectedReturnOrder.id}</p>
                                </div>
                                <button onClick={() => setSelectedReturnOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div style={{ padding: '20px', background: '#f9f9f9', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>User Context</p>
                                    <p style={{ fontWeight: 700 }}>{selectedReturnOrder.user?.name || selectedReturnOrder.user || 'Guest'}</p>
                                </div>
                                <div style={{ padding: '20px', background: '#f9f9f9', border: '1px solid #eee' }}>
                                    <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Refund Target</p>
                                    <p style={{ fontWeight: 700, color: '#c5a059' }}>₹{selectedReturnOrder.refundDetails?.refundAmount?.toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedReturnOrder.refundDetails && (
                                <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', background: '#fafafa' }}>
                                    <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '12px' }}>Provided Account & Reason</p>
                                    <div style={{ background: '#fff', padding: '10px', marginBottom: '15px', border: '1px dashed #c5a059', borderRadius: '4px' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>{selectedReturnOrder.orderStatus === 'cancelled' ? 'Cancellation' : 'Return'} Reason:</p>
                                        <p style={{ fontSize: '0.9rem', color: '#000', fontStyle: 'italic' }}>"{selectedReturnOrder.orderStatus === 'cancelled' ? (selectedReturnOrder.refundDetails.cancelReason || 'None') : (selectedReturnOrder.refundDetails.returnReason || 'None')}"</p>
                                    </div>
                                    <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Holder:</span><strong>{selectedReturnOrder.refundDetails.accountName}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Account:</span><strong>{selectedReturnOrder.refundDetails.accountNumber}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IFSC:</span><strong>{selectedReturnOrder.refundDetails.ifscCode}</strong></div>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '12px' }}>Admin Insight / Comments</label>
                                <textarea 
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    placeholder="Add comments for the customer..."
                                    style={{
                                        width: '100%', height: '100px', padding: '15px', borderRadius: '8px',
                                        border: '1px solid #eee', background: '#f5f5f5', resize: 'none', outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    className="hub-btn deliver" 
                                    style={{ flex: 1, background: '#c5a059', color: '#000', padding: '15px', fontWeight: 700 }}
                                    onClick={() => handleReturnAction(selectedReturnOrder._id || selectedReturnOrder.id, 'refund')}
                                >
                                    Process Refund
                                </button>
                                <button 
                                    className="hub-btn edit" 
                                    style={{ flex: 1, padding: '15px' }}
                                    onClick={() => handleReturnAction(selectedReturnOrder._id || selectedReturnOrder.id, 'later')}
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .order-filters-bar {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .filter-chip {
                    padding: 10px 20px;
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 50px;
                    cursor: pointer;
                    font-weight: 600;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                .filter-chip.active {
                    background: #1a1a1a;
                    color: white;
                    border-color: #1a1a1a;
                }
                .filter-chip .count {
                    font-size: 0.75rem;
                    background: #f0f0f0;
                    color: #1a1a1a;
                    padding: 2px 8px;
                    border-radius: 20px;
                }
                .filter-chip.active .count {
                    background: rgba(255,255,255,0.2);
                    color: white;
                }
                .date-city { display: flex; flex-direction: column; }
                .date-city small { color: #999; }
                .status-badge.paid { background: #e8f5e9; color: #2e7d32; }
                .status-badge.unpaid { background: #ffebee; color: #c62828; }
                .status-badge.shipped { background: #e3f2fd; color: #1976d2; }
                .text-btn-sm { 
                    background: none; border: none; color: #1a1a1a; 
                    font-weight: 600; cursor: pointer; text-decoration: underline;
                    font-size: 0.85rem;
                }
            `}</style>
        </div>
    );
};

export default AdminOrders;
