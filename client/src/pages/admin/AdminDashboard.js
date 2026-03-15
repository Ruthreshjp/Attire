import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const AdminDashboard = () => {
    const [rawData, setRawData] = useState({ products: [], users: [], orders: [] });
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('month');
    const [activeTab, setActiveTab] = useState('sales'); // sales, orders, users, transactions, refunds
    const [subFilter, setSubFilter] = useState('all'); // all, confirmed, cancelled
    const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);
    const [updatingRefund, setUpdatingRefund] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    setRawData({
                        products: res.data.products || [],
                        users: res.data.users || [],
                        orders: res.data.orders || []
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
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
    const confirmedOrders = periodOrders.filter(o => o.orderStatus !== 'cancelled');
    const cancelledOrders = periodOrders.filter(o => o.orderStatus === 'cancelled');
    const pendingRefunds = cancelledOrders.filter(o => o.refundDetails?.refundStatus === 'initiated' || o.refundDetails?.refundStatus === 'none' || !o.refundDetails?.refundStatus);
    
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
        } else {
            if (subFilter === 'confirmed') source = confirmedOrders;
            else if (subFilter === 'cancelled') source = cancelledOrders;
            else source = periodOrders;
        }

        source.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(item => {
            const key = formatKey(item.createdAt);
            if (!dataMap[key]) dataMap[key] = { name: key, sales: 0, orders: 0, users: 0, net: 0, refunds: 0 };
            
            if (activeTab === 'users') {
                dataMap[key].users += 1;
            } else if (activeTab === 'refunds') {
                dataMap[key].refunds += item.refundDetails?.refundAmount || 0;
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

    const handleUpdateRefundStatus = async (orderId, status) => {
        setUpdatingRefund(true);
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/refund`, { status }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.data.success) {
                alert(`Refund status updated to ${status}. Note: ₹50 cancellation fee applied.`);
                // Refresh dashboard data
                const resData = await axios.get('http://localhost:5000/api/admin/dashboard', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (resData.data.success) {
                    setRawData({
                        products: resData.data.products || [],
                        users: resData.data.users || [],
                        orders: resData.data.orders || []
                    });
                }
                setSelectedRefundOrder(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing refund');
        } finally {
            setUpdatingRefund(false);
        }
    };

    const renderChart = () => {
        const dataKey = activeTab === 'sales' ? 'sales' : 
                          activeTab === 'orders' ? 'orders' : 
                          activeTab === 'users' ? 'users' : 
                          activeTab === 'refunds' ? 'refunds' : 'net';
        
        const chartColor = activeTab === 'sales' ? '#c5a059' : 
                           activeTab === 'orders' ? '#000' : 
                           activeTab === 'users' ? '#4f46e5' : 
                           activeTab === 'refunds' ? '#f43f5e' : '#16a34a';

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
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => activeTab.includes('sales') || activeTab === 'net' ? `₹${v}` : v} />
                        <Tooltip
                            contentStyle={{ background: '#000', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [activeTab.includes('sales') || activeTab === 'net' ? `₹${value.toLocaleString()}` : value, activeTab.toUpperCase()]}
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
                            {activeTab === 'refunds' && <th>Action</th>}
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
                                {activeTab === 'refunds' && (
                                    <td>
                                        <button 
                                            className="refund-trigger-btn" 
                                            onClick={() => setSelectedRefundOrder(order)}
                                            disabled={order.refundDetails?.refundStatus === 'processed'}
                                        >
                                            {order.refundDetails?.refundStatus === 'processed' ? 'Refunded' : 'Curate Clearing'}
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
                        <span className="kpi-label">New Audiences</span>
                        <h2 className="kpi-value">{periodUsers.length}</h2>
                        <div className="kpi-meta">Onboarding count</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'refunds' ? 'active' : ''}`} onClick={() => { setActiveTab('refunds'); setSubFilter('all'); }}>
                        <span className="kpi-label">Refund Clearing</span>
                        <h2 className="kpi-value danger">{pendingRefunds.length}</h2>
                        <div className="kpi-meta text-danger">Action Required</div>
                    </div>
                    <div className={`kpi-card ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => { setActiveTab('transactions'); setSubFilter('all'); }}>
                        <span className="kpi-label">Net Liquidity</span>
                        <h2 className="kpi-value gold">₹{(totalSales - cancelledOrders.reduce((a, c) => a + (c.refundDetails?.refundAmount || 0), 0)).toLocaleString()}</h2>
                        <div className="kpi-meta text-gold">Post-reduction</div>
                    </div>
                </div>

                <div className="business-intelligence-panel anim from-top">
                    <div className="intelligence-grid">
                        <div className="intel-node">
                            <span className="node-label">Gross Capital</span>
                            <strong className="node-val">₹{totalSales.toLocaleString()}</strong>
                        </div>
                        <div className="intel-node">
                            <span className="node-label">Refunds Initiated</span>
                            <strong className="node-val text-danger">₹{cancelledOrders.reduce((a, c) => a + (c.refundDetails?.refundAmount || 0), 0).toLocaleString()}</strong>
                        </div>
                        <div className="intel-node">
                            <span className="node-label">Profitability Index</span>
                            <strong className="node-val gold">₹{(totalSales - cancelledOrders.reduce((a, c) => a + (c.refundDetails?.refundAmount || 0), 0)).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div className="dashboard-layout-grid">
                    <section className="chart-section">
                        <div className="panel-header">
                            <div className="tab-context">
                                <h3>{activeTab.toUpperCase()} Analysis</h3>
                                {activeTab !== 'users' && activeTab !== 'refunds' && (
                                    <div className="sub-filter-strip">
                                        <button className={subFilter === 'all' ? 'active' : ''} onClick={() => setSubFilter('all')}>All</button>
                                        <button className={subFilter === 'confirmed' ? 'active' : ''} onClick={() => setSubFilter('confirmed')}>Confirmed</button>
                                        <button className={subFilter === 'cancelled' ? 'active' : ''} onClick={() => setSubFilter('cancelled')}>Cancelled</button>
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

                {/* --- Refund Clearing Modal --- */}
                {selectedRefundOrder && (
                    <div className="luxury-modal-overlay">
                        <div className="clearing-modal anim from-bottom">
                            <div className="clearing-header">
                                <h2>Financial Clearing Process</h2>
                                <p>Initiating manual bank transfer for Order #{selectedRefundOrder.orderNumber}</p>
                                <div className="cancellation-notice">₹50 cancellation fee will be automatically notified to the user.</div>
                            </div>
                            
                            <div className="clearing-body">
                                <div className="bank-details-card">
                                    <div className="detail-entry"><span>Account Holder</span><strong>{selectedRefundOrder.refundDetails?.accountName || 'N/A'}</strong></div>
                                    <div className="detail-entry"><span>Account Number</span><strong>{selectedRefundOrder.refundDetails?.accountNumber || 'N/A'}</strong></div>
                                    <div className="detail-entry"><span>IFSC Protocol</span><strong>{selectedRefundOrder.refundDetails?.ifscCode || 'N/A'}</strong></div>
                                    <div className="detail-entry"><span>Net Refund</span><strong className="gold">₹{selectedRefundOrder.refundDetails?.refundAmount?.toLocaleString()}</strong></div>
                                </div>
                            </div>

                            <div className="clearing-footer">
                                <button className="clearing-btn success" disabled={updatingRefund} onClick={() => handleUpdateRefundStatus(selectedRefundOrder._id, 'processed')}>
                                    {updatingRefund ? 'Processing...' : 'Mark as Refunded'}
                                </button>
                                <button className="clearing-btn" onClick={() => setSelectedRefundOrder(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
