import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

const AdminOrders = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const [orders, setOrders] = useState([
        { id: '#ORD-7721', user: 'John Doe', amount: 12999, status: 'Unpaid', date: 'Feb 13, 2024', city: 'Mumbai' },
        { id: '#ORD-7720', user: 'Sarah Smith', amount: 5599, status: 'Paid', date: 'Feb 12, 2024', city: 'Delhi' },
        { id: '#ORD-7719', user: 'Michael Brown', amount: 15999, status: 'Shipped', date: 'Feb 10, 2024', city: 'Bangalore' },
        { id: '#ORD-7718', user: 'Emma Wilson', amount: 8999, status: 'Paid', date: 'Feb 09, 2024', city: 'Chennai' },
        { id: '#ORD-7717', user: 'David Miller', amount: 4299, status: 'Shipped', date: 'Feb 08, 2024', city: 'Pune' },
    ]);

    const filters = ['All', 'Paid', 'Unpaid', 'Shipped'];

    const filteredOrders = activeFilter === 'All'
        ? orders
        : orders.filter(order => order.status === activeFilter);

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
                                {filter === 'All' ? orders.length : orders.filter(o => o.status === filter).length}
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
