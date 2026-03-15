import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';
import axios from 'axios';

const AdminOrders = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/orders', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    setOrders(res.data.orders);
                }
            } catch (err) {
                console.error('Error fetching admin orders:', err);
            }
        };

        fetchOrders();
    }, []);

    const filters = ['All', 'Confirmed', 'Cancelled'];

    const filteredOrders = activeFilter === 'All'
        ? orders
        : orders.filter(order => {
            if (activeFilter === 'Confirmed') {
                return order.orderStatus !== 'cancelled';
            } else if (activeFilter === 'Cancelled') {
                return order.orderStatus === 'cancelled';
            }
            return true;
        });

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
                        <span className="card-label">Deliveries</span>
                        <h2 className="card-value">{orders.filter(o => o.orderStatus === 'delivered' || o.status === 'delivered').length}</h2>
                        <div className="card-trend">Fulfilled cycles</div>
                    </div>
                    <div className="intel-card rose">
                        <span className="card-label">Active Cycles</span>
                        <h2 className="card-value">{orders.filter(o => o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered').length}</h2>
                        <div className="card-trend">In-process flow</div>
                    </div>
                </div>

                <div className="order-filters-bar-v2">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`filter-pill-v2 ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                            <span className="pill-count">
                                {filter === 'All' ? orders.length : orders.filter(o => {
                                    if (filter === 'Confirmed') return o.orderStatus !== 'cancelled';
                                    if (filter === 'Cancelled') return o.orderStatus === 'cancelled';
                                    return true;
                                }).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="listing-intelligence-vessel">
                    <div className="luxury-table-wrapper-v2">
                        <table className="luxury-table-v2">
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Client</th>
                                    <th>Investment</th>
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
                                                <button className="hub-btn edit">View Flow</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
