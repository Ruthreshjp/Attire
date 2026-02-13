import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });

    useEffect(() => {
        // In a real app, fetch these from API
        // For now, mock data
        setStats({
            totalSales: 125499,
            totalOrders: 48,
            totalProducts: 12,
            totalUsers: 156
        });
    }, []);

    const recentOrders = [
        { id: '#ORD-7721', user: 'John Doe', amount: 15999, status: 'Pending', date: 'Feb 12, 2024' },
        { id: '#ORD-7720', user: 'Sarah Smith', amount: 5599, status: 'Shipped', date: 'Feb 11, 2024' },
        { id: '#ORD-7719', user: 'Michael Brown', amount: 12999, status: 'Delivered', date: 'Feb 10, 2024' },
    ];

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Dashboard Overview</h1>
                    <div className="admin-user-pill">
                        Admin User
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon sales">💰</div>
                        <div className="stat-info">
                            <h3>Total Sales</h3>
                            <p className="stat-value">₹{stats.totalSales.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orders">📜</div>
                        <div className="stat-info">
                            <h3>Total Orders</h3>
                            <p className="stat-value">{stats.totalOrders}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon products">📦</div>
                        <div className="stat-info">
                            <h3>Products</h3>
                            <p className="stat-value">{stats.totalProducts}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon users">👥</div>
                        <div className="stat-info">
                            <h3>Users</h3>
                            <p className="stat-value">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="recent-orders-card">
                        <h2>Recent Orders</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>{order.id}</strong></td>
                                        <td>{order.user}</td>
                                        <td>₹{order.amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{order.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
