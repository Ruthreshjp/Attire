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
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-info">
                        <h1>Order Management</h1>
                        <p>Track and process customer purchases</p>
                    </div>
                </header>

                <div className="order-filters-bar">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                            <span className="count">
                                {filter === 'All' ? orders.length : orders.filter(o => {
                                    if (filter === 'Confirmed') return o.orderStatus !== 'cancelled';
                                    if (filter === 'Cancelled') return o.orderStatus === 'cancelled';
                                    return true;
                                }).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="orders-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date & City</th>
                                <th>Amount</th>
                                <th>Payment Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan="6" className="empty-row">No {activeFilter.toLowerCase()} orders found</td></tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>{order.id}</strong></td>
                                        <td>{order.user}</td>
                                        <td>
                                            <div className="date-city">
                                                <span>{order.date}</span>
                                                <small>{order.city}</small>
                                            </div>
                                        </td>
                                        <td>₹{order.amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="text-btn-sm">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
