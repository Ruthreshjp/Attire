import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useNotification } from '../../context/NotificationContext';
import './AdminDashboard.css';
import axios from 'axios';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const AdminDashboard = () => {
    const [rawData, setRawData] = useState({ products: [], users: [], orders: [] });
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('month');
    const [activeTab, setActiveTab] = useState('sales'); // sales, orders, users, transactions, refunds, deliveries, returns
    const [subFilter, setSubFilter] = useState('all'); // all, confirmed, cancelled
    const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);
    const [updatingRefund, setUpdatingRefund] = useState(false);
    const [adminComment, setAdminComment] = useState('');
    const { showAlert } = useNotification();

    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dashboard`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    setRawData({
                        products: res.data.products || [],
                        users: res.data.users || [],
                        orders: res.data.orders || []
                    });
                } else {
                    setError('Failed to load dashboard data');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Error connecting to intelligence center');
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const filterByTimeframe = (date, tf) => {
        if (!date) return false;
        const now = new Date();
        const checkDate = new Date(date);
        
        const diffMs = now.getTime() - checkDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        switch (tf) {
            case 'day': return diffHours <= 24;
            case 'week': return diffDays <= 7;
            case 'month': return diffDays <= 30;
            case 'year': return diffDays <= 365;
            default: return true;
        }
    };

    const periodOrders = rawData.orders.filter(o => filterByTimeframe(o.createdAt, timeframe));
    const paidOrders = periodOrders.filter(o => o.paymentStatus === 'paid');
    const confirmedOrders = periodOrders.filter(o => o.orderStatus !== 'cancelled' && o.orderStatus !== 'returned' && o.orderStatus !== 'return_pending');
    const cancelledOrders = periodOrders.filter(o => o.orderStatus === 'cancelled');
    const returnsOrders = periodOrders.filter(o => o.orderStatus === 'returned' || o.orderStatus === 'return_pending');
    const deliveredOrders = periodOrders.filter(o => o.orderStatus === 'processed' || o.orderStatus === 'delivered');
    const pendingRefunds = [...cancelledOrders, ...returnsOrders].filter(o => o.orderStatus === 'return_pending' || (o.orderStatus === 'cancelled' && (o.refundDetails?.refundStatus === 'initiated' || o.refundDetails?.refundStatus === 'none' || !o.refundDetails?.refundStatus)));
    
    const totalSales = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
    const periodUsers = rawData.users.filter(u => filterByTimeframe(u.createdAt, timeframe));

    const generateGraphData = () => {
        const dataMap = {};
        let formatKey;
        if (timeframe === 'day') formatKey = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit' });
        else if (timeframe === 'week' || timeframe === 'month') formatKey = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        else formatKey = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short' });

        let source = [];
        if (activeTab === 'users') {
            source = periodUsers;
        } else if (activeTab === 'refunds') {
            source = cancelledOrders;
        } else if (activeTab === 'returns') {
            source = returnsOrders;
        } else if (activeTab === 'deliveries') {
            source = deliveredOrders;
        } else {
            if (subFilter === 'confirmed') source = confirmedOrders;
            else if (subFilter === 'cancelled') source = cancelledOrders;
            else if (subFilter === 'returned') source = returnsOrders;
            else source = periodOrders;
        }

        source.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(item => {
            const key = formatKey(item.createdAt);
            if (!dataMap[key]) dataMap[key] = { name: key, sales: 0, orders: 0, users: 0, net: 0, refunds: 0, deliveries: 0, returns: 0 };
            
            if (activeTab === 'users') {
                dataMap[key].users += 1;
            } else if (activeTab === 'refunds') {
                dataMap[key].refunds += item.refundDetails?.refundAmount || 0;
            } else if (activeTab === 'deliveries') {
                dataMap[key].deliveries += 1;
            } else if (activeTab === 'returns') {
                dataMap[key].returns += 1;
            } else {
                dataMap[key].orders += 1;
                if (item.paymentStatus === 'paid') {
                    dataMap[key].sales += item.total;
                    dataMap[key].net += item.total;
                }
                if (item.orderStatus === 'cancelled' && item.refundDetails) {
                    dataMap[key].net -= (item.refundDetails.refundAmount || 0);
                }
            }
        });
        const finalData = Object.values(dataMap);
        // Fallback for single data point to make it visible in AreaChart
        if (finalData.length === 1) {
            return [{ ...finalData[0], name: 'Start' }, finalData[0]];
        }
        return finalData;
    };

    const graphData = generateGraphData();

    const categoryMap = {};
    rawData.products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoriesList = Object.keys(categoryMap).map(k => ({ category: k, count: categoryMap[k] }));

    const handleReturnAction = async (orderId, action) => {
        setUpdatingRefund(true);
        try {
            const order = rawData.orders.find(o => o._id === orderId);
            const isCancelled = order?.orderStatus === 'cancelled';
            
            const url = `${process.env.REACT_APP_API_URL}/api/admin/orders/${orderId}/${isCancelled ? 'refund' : 'return-action'}`;
            const data = isCancelled ? { status: action === 'refund' ? 'processed' : 'processing' } : { action, comment: adminComment };

            const res = await axios.put(url, data, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.data.success) {
                // Close modal and reset state immediately
                setSelectedRefundOrder(null);
                setAdminComment('');
                
                // Show success message
                showAlert(`Capital Reversal Authorized: Order #${order?.orderNumber || 'N/A'} has been successfully processed.`, 'success');

                // Refresh dashboard data silently
                try {
                    const resData = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dashboard`, {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    if (resData.data && resData.data.success) {
                        setRawData({
                            products: resData.data.products || [],
                            users: resData.data.users || [],
                            orders: resData.data.orders || []
                        });
                    }
                } catch (fetchErr) {
                    console.error('Silent refresh failed:', fetchErr);
                }
            }
        } catch (err) {
            showAlert(err.response?.data?.message || 'Error processing action');
        } finally {
            setUpdatingRefund(false);
        }
    };

    const renderChart = () => {
        const dataKey = activeTab === 'sales' ? 'sales' : 
                          activeTab === 'orders' ? 'orders' : 
                          activeTab === 'users' ? 'users' : 
                          activeTab === 'refunds' ? 'refunds' : 
                          activeTab === 'deliveries' ? 'deliveries' :
                          activeTab === 'returns' ? 'returns' : 'net';
        
        const chartColor = activeTab === 'sales' ? '#c5a059' : 
                           activeTab === 'orders' ? '#000' : 
                           activeTab === 'users' ? '#4f46e5' : 
                           activeTab === 'refunds' ? '#f43f5e' : 
                           activeTab === 'deliveries' ? '#0d9488' :
                           activeTab === 'returns' ? '#8a6d3b' : '#16a34a';

        return (
            <div className="analytics-vessel">
                <ResponsiveContainer width="100%" height={380}>
                    <AreaChart data={graphData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => activeTab.includes('sales') || activeTab === 'net' || activeTab === 'refunds' ? `₹${v}` : v} />
                        <Tooltip
                            contentStyle={{ background: '#000', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [activeTab.includes('sales') || activeTab === 'net' || activeTab === 'refunds' ? `₹${value.toLocaleString()}` : value, activeTab.toUpperCase()]}
                        />
                        <Area type="monotone" dataKey={dataKey} stroke={chartColor} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderOrdersTable = () => {
        let tableSource = [];
        if (activeTab === 'refunds') {
            tableSource = cancelledOrders;
        } else if (activeTab === 'returns') {
            tableSource = returnsOrders;
        } else if (activeTab === 'deliveries') {
            tableSource = deliveredOrders;
        } else if (activeTab === 'users') {
            return (
                <div className="luxury-table-wrapper">
                    <table className="luxury-table">
                        <thead>
                            <tr><th>Identity</th><th>Onboarding</th><th>Orders</th></tr>
                        </thead>
                        <tbody>
                            {periodUsers.slice(0, 10).map(u => (
                                <tr key={u._id}>
                                    <td><div className="client-info"><strong>{u.name}</strong><span>{u.email}</span></div></td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td>{rawData.orders.filter(o => o.user?._id === u._id).length} units</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            if (subFilter === 'confirmed') tableSource = confirmedOrders;
            else if (subFilter === 'cancelled') tableSource = cancelledOrders;
            else if (subFilter === 'returned') tableSource = returnsOrders;
            else tableSource = periodOrders;
        }

        return (
            <div className="luxury-table-wrapper">
                <table className="luxury-table">
                    <thead>
                        <tr>
                            <th>Identity</th>
                            <th>Client</th>
                            <th>Investment</th>
                            <th>Status</th>
                            <th>Timeline</th>
                            {(activeTab === 'refunds' || activeTab === 'returns') && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {tableSource.slice(0, 8).map(order => (
                            <tr key={order._id}>
                                <td><span className="order-tag">#{order.orderNumber}</span></td>
                                <td>
                                    <div className="client-info">
                                        <strong>{order.user?.name || order.shippingAddress?.name}</strong>
                                        <span>{order.paymentMethod}</span>
                                    </div>
                                </td>
                                <td>₹{order.total.toLocaleString()}</td>
                                <td><span className={`pill ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                {(activeTab === 'refunds' || activeTab === 'returns') && (
                                    <td>
                                        <button 
                                            className="refund-trigger-btn" 
                                            onClick={() => {
                                                setSelectedRefundOrder(order);
                                                setAdminComment(order.refundDetails?.adminComment || '');
                                            }}
                                            disabled={order.refundDetails?.refundStatus === 'processed' || order.orderStatus === 'returned'}
                                        >
                                            {(order.refundDetails?.refundStatus === 'processed' || order.orderStatus === 'returned') ? (activeTab === 'returns' ? 'Processed' : 'Refunded') : (activeTab === 'returns' ? 'Verify IQ' : 'Curate Clearing')}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) return (
        <div className="premium-admin-canvas">
            <AdminSidebar />
            <div className="admin-loading">
                <div className="luxury-spinner"></div>
                <p>Curating Dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="premium-admin-canvas">
            <AdminSidebar />
            <main className="admin-viewport">
                <header className="viewport-header">
                    <div className="title-stack">
                        <h1>Intelligence Center</h1>
                        <p>Enterprise Management Dashboard</p>
                    </div>
                    <div className="header-actions">
                        <div className="time-pill">
                            <span>Period:</span>
                            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                                <option value="day">Last 24 Hours</option>
                                <option value="week">Weekly View</option>
                                <option value="month">Monthly Cycle</option>
                                <option value="year">Fiscal Year</option>
                            </select>
                        </div>
                    </div>
                </header>

                <div className="kpi-grid">
                    <div className={`kpi-card ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => { setActiveTab('sales'); setSubFilter('all'); }}>
                        <span className="kpi-label">Gross Revenue</span>
                        <h2 className="kpi-value">₹{totalSales.toLocaleString()}</h2>
                        <div className="kpi-meta">Capital Intake</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setSubFilter('all'); }}>
                        <span className="kpi-label">Order Volume</span>
                        <h2 className="kpi-value">{periodOrders.length}</h2>
                        <div className="kpi-meta">{paidOrders.length} verified</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setSubFilter('all'); }}>
                        <span className="kpi-label">Users</span>
                        <h2 className="kpi-value">{periodUsers.length}</h2>
                        <div className="kpi-meta">Onboarding count</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'refunds' ? 'active' : ''}`} onClick={() => { setActiveTab('refunds'); setSubFilter('all'); }}>
                        <span className="kpi-label">Refund Clearing</span>
                        <h2 className="kpi-value danger">{pendingRefunds.length}</h2>
                        <div className="kpi-meta text-danger">Action Required</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => { setActiveTab('transactions'); setSubFilter('all'); }}>
                        <span className="kpi-label">Order Statistics</span>
                        <h2 className="kpi-value gold">{periodOrders.length} placed</h2>
                        <div className="kpi-meta text-gold">{cancelledOrders.length} cancelled</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'deliveries' ? 'active' : ''}`} onClick={() => { setActiveTab('deliveries'); setSubFilter('all'); }}>
                        <span className="kpi-label">Deliveries</span>
                        <h2 className="kpi-value" style={{ color: '#0d9488' }}>
                            {deliveredOrders.length}
                        </h2>
                        <div className="kpi-meta" style={{ color: '#0d9488' }}>Fulfilled cycles</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => { setActiveTab('returns'); setSubFilter('all'); }}>
                        <span className="kpi-label">Returns</span>
                        <h2 className="kpi-value" style={{ color: '#8a6d3b' }}>
                            {returnsOrders.length}
                        </h2>
                        <div className="kpi-meta" style={{ color: '#8a6d3b' }}>Post-delivery reversals</div>
                    </div>
                </div>

                <div className="business-intelligence-panel">
                    <div className="intelligence-grid">
                        <div className="intel-node">

                            <span className="node-label">Gross Capital</span>
                            <strong className="node-val">₹{totalSales.toLocaleString()}</strong>
                        </div>
                        <div className="intel-node">
                            <span className="node-label">Refunds/Returns</span>
                            <strong className="node-val text-danger">₹{(cancelledOrders.reduce((a, c) => a + (c.refundDetails?.refundAmount || 0), 0) + returnsOrders.reduce((a,c) => a+ (c.total || 0), 0)).toLocaleString()}</strong>
                        </div>
                        <div className="intel-node">
                            <span className="node-label">Profitability Index</span>
                            <strong className="node-val gold">₹{(totalSales - (cancelledOrders.reduce((a, c) => a + (c.refundDetails?.refundAmount || 0), 0) + returnsOrders.reduce((a,c) => a+ (c.total || 0), 0))).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div className="dashboard-layout-grid">
                    <section className="chart-section">
                        <div className="panel-header">
                            <div className="tab-context">
                                <h3>{activeTab.toUpperCase()} Analysis</h3>
                                {['sales', 'orders', 'transactions'].includes(activeTab) && (
                                    <div className="sub-filter-strip">
                                        <button className={subFilter === 'all' ? 'active' : ''} onClick={() => setSubFilter('all')}>All</button>
                                        <button className={subFilter === 'confirmed' ? 'active' : ''} onClick={() => setSubFilter('confirmed')}>Confirmed</button>
                                        <button className={subFilter === 'cancelled' ? 'active' : ''} onClick={() => setSubFilter('cancelled')}>Cancelled</button>
                                        <button className={subFilter === 'returned' ? 'active' : ''} onClick={() => setSubFilter('returned')}>Returned</button>
                                    </div>
                                )}
                            </div>
                            <div className="chart-legend">
                                <span className="legend-dot" style={{ backgroundColor: activeTab === 'sales' ? '#c5a059' : activeTab === 'orders' ? '#000' : activeTab === 'users' ? '#4f46e5' : activeTab === 'refunds' ? '#f43f5e' : '#16a34a' }}></span> 
                                Data Pulse
                            </div>
                        </div>
                        {renderChart()}
                    </section>

                    <section className="table-section">
                        <div className="panel-header">
                            <h3>{activeTab === 'refunds' ? 'Pending Returns' : 'Cycle Transactions'}</h3>
                            <button className="text-action-btn">Full Intelligence</button>
                        </div>
                        {renderOrdersTable()}
                    </section>
                    
                    <section className="inventory-section">
                        <div className="panel-header">
                            <h3>Collection Density</h3>
                        </div>
                        <div className="density-list">
                            {categoriesList.map((cat, idx) => (
                                <div key={idx} className="density-item">
                                    <div className="density-info">
                                        <strong>{cat.category}</strong>
                                        <span>{cat.count} Artifacts</span>
                                    </div>
                                    <div className="density-bar-vessel">
                                        <div className="density-bar-fill" style={{ width: `${(cat.count / rawData.products.length) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* --- Refund/Return Intelligence Modal --- */}
                {selectedRefundOrder && (
                    <div className="luxury-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000 }}>
                        <div className="return-modal" style={{ 
                            background: '#fff', width: '90%', maxWidth: '600px', padding: '40px', borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <div>
                                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: '#000' }}>{selectedRefundOrder?.orderStatus === 'cancelled' ? 'Refund Policy' : 'Return Intelligence'}</h2>
                                    <p style={{ color: '#aaa', fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '5px' }}>Processing Order #{selectedRefundOrder?.orderNumber || 'N/A'}</p>
                                </div>
                                <button onClick={() => setSelectedRefundOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem', color: '#ccc' }}>×</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div style={{ padding: '20px', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>User Context</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedRefundOrder?.user?.name || selectedRefundOrder?.shippingAddress?.name || 'Guest'}</p>
                                </div>
                                <div style={{ padding: '20px', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Refund Target</p>
                                    <p style={{ fontWeight: 700, color: '#c5a059', fontSize: '1.1rem' }}>₹{selectedRefundOrder?.refundDetails?.refundAmount?.toLocaleString() || '0'}</p>
                                </div>
                            </div>

                            {selectedRefundOrder?.refundDetails && (
                                <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', background: '#fafafa', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Provided Account & Reason</p>
                                    <div style={{ background: '#fff', padding: '12px', marginBottom: '15px', border: '1px dashed #c5a059', borderRadius: '6px' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>{selectedRefundOrder?.orderStatus === 'cancelled' ? 'Cancellation' : 'Return'} Reason:</p>
                                        <p style={{ fontSize: '0.9rem', color: '#000', fontStyle: 'italic', lineHeight: '1.4' }}>"{selectedRefundOrder?.orderStatus === 'cancelled' ? (selectedRefundOrder?.refundDetails?.cancelReason || 'None') : (selectedRefundOrder?.refundDetails?.returnReason || 'None')}"</p>
                                    </div>
                                    <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Holder:</span><strong>{selectedRefundOrder?.refundDetails?.accountName || 'N/A'}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Account:</span><strong>{selectedRefundOrder?.refundDetails?.accountNumber || 'N/A'}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>IFSC:</span><strong>{selectedRefundOrder?.refundDetails?.ifscCode || 'N/A'}</strong></div>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>Admin Insight / Comments</label>
                                <textarea 
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    placeholder="Add comments for the customer..."
                                    style={{
                                        width: '100%', height: '100px', padding: '15px', borderRadius: '8px',
                                        border: '1px solid #eee', background: '#f5f5f5', resize: 'none', outline: 'none',
                                        fontSize: '0.9rem', color: '#333'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    disabled={updatingRefund}
                                    style={{ 
                                        flex: 1, background: '#c5a059', color: '#000', padding: '15px', fontWeight: 700, 
                                        border: 'none', borderRadius: '8px', cursor: updatingRefund ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onClick={() => handleReturnAction(selectedRefundOrder?._id, 'refund')}
                                >
                                    {updatingRefund ? 'Processing...' : (selectedRefundOrder?.orderStatus === 'cancelled' ? 'Confirm Refund' : 'Process Return')}
                                </button>
                                <button 
                                    disabled={updatingRefund}
                                    style={{ 
                                        flex: 1, padding: '15px', background: '#000', color: '#fff', 
                                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                    onClick={() => handleReturnAction(selectedRefundOrder?._id, 'later')}
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
