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
    Line
} from 'recharts';

const AdminDashboard = () => {
    const [rawData, setRawData] = useState({ products: [], users: [], orders: [] });
    const [loading, setLoading] = useState(true);
    
    const [timeframe, setTimeframe] = useState('month'); 
    const [activeTab, setActiveTab] = useState('sales'); 
    const [showGraph, setShowGraph] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

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
        
        now.setHours(0,0,0,0);
        const diffMs = now.getTime() - checkDate.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        switch (tf) {
            case 'day': return diffDays <= 1; // Today
            case 'week': return diffDays <= 7;
            case 'month': return diffDays <= 30;
            case 'year': return diffDays <= 365;
            default: return true;
        }
    };

    const periodOrders = rawData.orders.filter(o => filterByTimeframe(o.createdAt, timeframe));
    const paidOrders = periodOrders.filter(o => o.paymentStatus === 'paid');
    
    const totalSales = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
    const periodUsers = rawData.users.filter(u => filterByTimeframe(u.createdAt, timeframe));

    const generateGraphData = () => {
        const dataMap = {};
        
        let formatKey;
        if (timeframe === 'day') {
            formatKey = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeframe === 'week' || timeframe === 'month') {
            formatKey = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            formatKey = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }

        // Initialize missing days if needed? Simple map approach for now
        periodOrders.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(o => {
            const key = formatKey(o.createdAt);
            if (!dataMap[key]) {
                dataMap[key] = { name: key, sales: 0, orders: 0 };
            }
            dataMap[key].orders += 1;
            if (o.paymentStatus === 'paid') {
                dataMap[key].sales += o.total;
            }
        });

        return Object.values(dataMap);
    };

    const graphData = generateGraphData();

    // category logic
    const categoryMap = {};
    rawData.products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoriesList = Object.keys(categoryMap).map(k => ({ category: k, count: categoryMap[k] }));

    // User Last Purchase map
    const userLastPurchaseMap = {};
    rawData.orders.forEach(o => {
        if (o.user && o.user._id) {
            const uid = o.user._id;
            const d = new Date(o.createdAt);
            if (!userLastPurchaseMap[uid] || new Date(userLastPurchaseMap[uid]) < d) {
                userLastPurchaseMap[uid] = o.createdAt;
            }
        }
    });

    const renderGraph = () => {
        if (!showGraph || graphData.length === 0) return null;
        
        return (
            <div className="graph-container">
                <h3 className="graph-title">Statistics ({timeframe})</h3>
                <ResponsiveContainer width="100%" height={300}>
                    {activeTab === 'sales' ? (
                        <LineChart data={graphData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="sales" stroke="#D4AF37" activeDot={{ r: 8 }} name="Sales Content" />
                        </LineChart>
                    ) : (
                        <BarChart data={graphData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="orders" fill="#1a1a1a" name="Total Orders" />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        );
    };

    const renderSalesView = () => (
        <div className="tab-view-content">
            <h2 className="view-title">Sales Data ({timeframe})</h2>
            <div className="aggregate-highlight">
                <span className="agg-label">Total Sum:</span>
                <span className="agg-value text-gold">₹{totalSales.toLocaleString()}</span>
            </div>
            <button className="view-stats-btn" onClick={() => setShowGraph(!showGraph)}>
                {showGraph ? 'Hide Statistics' : 'View Statistics Graph'}
            </button>
            {renderGraph()}
        </div>
    );

    const renderOrdersView = () => (
        <div className="tab-view-content">
            <h2 className="view-title">Orders Data ({timeframe})</h2>
            <div className="aggregate-highlight">
                <span className="agg-label">Total Orders:</span>
                <span className="agg-value">{periodOrders.length}</span>
            </div>
            <button className="view-stats-btn" onClick={() => setShowGraph(!showGraph)}>
                {showGraph ? 'Hide Statistics' : 'View Statistics Graph'}
            </button>
            {renderGraph()}

            <div className="table-responsive">
                <table className="admin-table mt-4">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Details</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {periodOrders.map(order => (
                            <tr key={order._id}>
                                <td>{order.orderNumber}</td>
                                <td>{order.user ? order.user.name : order.shippingAddress?.name}</td>
                                <td>₹{order.total.toLocaleString()}</td>
                                <td>
                                    <div className="order-item-detail">
                                        {order.items.map((it, idx) => (
                                            <div key={idx} className="small-text text-muted">
                                                {it.name} (Q: {it.quantity})
                                            </div>
                                        ))}
                                        <div className="pay-method-badge">{order.paymentMethod}</div>
                                    </div>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td><span className={`status-badge ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderProductsView = () => (
        <div className="tab-view-content">
            <h2 className="view-title">
                {selectedCategory ? `Products in ${selectedCategory.toUpperCase()}` : 'Product Categories & Inventory'}
            </h2>
            
            {selectedCategory ? (
                <>
                    <button className="view-stats-btn" onClick={() => setSelectedCategory(null)}>
                        &larr; Back to Categories
                    </button>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawData.products.filter(p => (p.category || 'Uncategorized') === selectedCategory).map(product => (
                                    <tr key={product._id}>
                                        <td><strong>{product.title}</strong></td>
                                        <td>{product.category}</td>
                                        <td>Available</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="categories-grid">
                    {categoriesList.map((cat, idx) => (
                        <div key={idx} className="category-stat-card clickable" onClick={() => setSelectedCategory(cat.category)}>
                            <h3>{cat.category.toUpperCase()}</h3>
                            <p>{cat.count} Items Available</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderUsersView = () => (
        <div className="tab-view-content">
            <h2 className="view-title">User Analytics ({timeframe})</h2>
            <div className="aggregate-highlight">
                <span className="agg-label">New Users:</span>
                <span className="agg-value">{periodUsers.length}</span>
            </div>

            <div className="table-responsive">
                <table className="admin-table mt-4">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Joining Date</th>
                            <th>Last Login Date</th>
                            <th>Last Purchase</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rawData.users.map(user => {
                            const lastPur = userLastPurchaseMap[user._id];
                            return (
                                <tr key={user._id}>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</td>
                                    <td>{lastPur ? new Date(lastPur).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) return <div className="admin-layout"><AdminSidebar /><main className="admin-main">Loading Data...</main></div>;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Dashboard Detailed Analytics</h1>
                        <p className="admin-subtitle">Aggregated system intelligence</p>
                    </div>
                    
                    <div className="timeframe-selector">
                        <label>Statistics Period: </label>
                        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                            <option value="day">Day-wise</option>
                            <option value="week">Week-wise</option>
                            <option value="month">Month-wise</option>
                            <option value="year">Year-wise</option>
                        </select>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className={`stat-card ${activeTab === 'sales' ? 'active-stat' : ''}`} onClick={() => { setActiveTab('sales'); setShowGraph(false); }}>
                        <div className="stat-icon sales">💰</div>
                        <div className="stat-info">
                            <h3>Total Sales</h3>
                            <p className="stat-value text-gold">₹{totalSales.toLocaleString()}</p>
                            <p className="stat-meta">Filter applies: {timeframe}</p>
                        </div>
                    </div>
                    
                    <div className={`stat-card ${activeTab === 'orders' ? 'active-stat' : ''}`} onClick={() => { setActiveTab('orders'); setShowGraph(false); }}>
                        <div className="stat-icon orders">📜</div>
                        <div className="stat-info">
                            <h3>Total Orders</h3>
                            <p className="stat-value">{periodOrders.length}</p>
                            <p className="stat-meta">Filter applies: {timeframe}</p>
                        </div>
                    </div>

                    <div className={`stat-card ${activeTab === 'products' ? 'active-stat' : ''}`} onClick={() => { setActiveTab('products'); setShowGraph(false); }}>
                        <div className="stat-icon products">📦</div>
                        <div className="stat-info">
                            <h3>Products</h3>
                            <p className="stat-value">{rawData.products.length}</p>
                            <p className="stat-meta">Aggregate items</p>
                        </div>
                    </div>

                    <div className={`stat-card ${activeTab === 'users' ? 'active-stat' : ''}`} onClick={() => { setActiveTab('users'); setShowGraph(false); }}>
                        <div className="stat-icon users">👥</div>
                        <div className="stat-info">
                            <h3>Users</h3>
                            <p className="stat-value">{periodUsers.length}</p>
                            <p className="stat-meta">New joined ({timeframe})</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    {activeTab === 'sales' && renderSalesView()}
                    {activeTab === 'orders' && renderOrdersView()}
                    {activeTab === 'products' && renderProductsView()}
                    {activeTab === 'users' && renderUsersView()}
                </div>

            </main>
        </div>
    );
};

export default AdminDashboard;
