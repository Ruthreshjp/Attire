import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const MyOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([
        { id: '#ORD-7721', amount: 12999, status: 'Processing', date: 'Feb 13, 2024', items: 3 },
        { id: '#ORD-7718', amount: 8999, status: 'Shipped', date: 'Feb 09, 2024', items: 1 },
        { id: '#ORD-7710', amount: 2599, status: 'Delivered', date: 'Feb 01, 2024', items: 2 },
    ]);

    const [selectedOrder, setSelectedOrder] = useState(null);

    if (!user) return <div className="loading">Please login to view your orders.</div>;

    if (selectedOrder) {
        return (
            <div className="profile-page">
                <Navbar />
                <div className="profile-container">
                    <button className="back-btn" onClick={() => setSelectedOrder(null)}>
                        &larr; Back to My Orders
                    </button>
                    <header className="profile-header">
                        <div className="profile-info">
                            <h1>Order {selectedOrder.id}</h1>
                            <p>Placed on {selectedOrder.date} &bull; {selectedOrder.status}</p>
                        </div>
                    </header>
                    <div className="profile-content">
                        <div className="profile-card">
                            <div className="order-details-full">
                                <h3>Order Summary</h3>
                                <div className="detail-row">
                                    <span>Status:</span>
                                    <span className={`status-tag ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Total Amount:</span>
                                    <span className="total-price">₹{selectedOrder.amount.toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Total Items:</span>
                                    <span>{selectedOrder.items}</span>
                                </div>
                                <div className="order-items-minimal">
                                    <h4>Items in this order</h4>
                                    <p>Sample item details would appear here...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                <header className="profile-header">
                    <div className="profile-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1>My Orders</h1>
                        <p>Manage and track your recent purchases</p>
                    </div>
                </header>

                <div className="profile-content">
                    <div className="profile-card">
                        <div className="orders-list">
                            {orders.length === 0 ? (
                                <div className="no-orders-msg">
                                    <p>You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="order-item-card">
                                        <div className="order-main-info">
                                            <div className="id-date">
                                                <span className="order-id">Order {order.id}</span>
                                                <span className="order-date">Placed on {order.date}</span>
                                            </div>
                                            <div className="order-status">
                                                <span className={`status-tag ${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="order-summary">
                                            <div className="summary-col">
                                                <label>Total Items</label>
                                                <span>{order.items} items</span>
                                            </div>
                                            <div className="summary-col">
                                                <label>Total Amount</label>
                                                <span className="total-price">₹{order.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="summary-col actions">
                                                <button
                                                    className="view-order-btn"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .orders-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .order-item-card {
                    border: 1px solid #eee;
                    border-radius: 12px;
                    padding: 20px;
                    background: #fafafa;
                    transition: all 0.2s;
                }
                .order-item-card:hover {
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    border-color: #ddd;
                }
                .order-main-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                .id-date {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .order-id {
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: #1a1a1a;
                }
                .order-date {
                    font-size: 0.9rem;
                    color: #999;
                }
                .status-tag {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-tag.processing { background: #fff8e1; color: #f57f17; }
                .status-tag.shipped { background: #e3f2fd; color: #1976d2; }
                .status-tag.delivered { background: #e8f5e9; color: #2e7d32; }
                
                .order-summary {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    align-items: center;
                }
                .summary-col {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .summary-col label {
                    font-size: 0.75rem;
                    color: #999;
                    text-transform: uppercase;
                    font-weight: 600;
                }
                .summary-col span {
                    font-weight: 600;
                    color: #444;
                }
                .total-price {
                    color: #1a1a1a !important;
                    font-size: 1.1rem;
                }
                .summary-col.actions {
                    align-items: flex-end;
                }
                .view-order-btn {
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .view-order-btn:hover {
                    background: #333;
                    transform: translateY(-1px);
                }
                @media (max-width: 640px) {
                    .order-summary {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                    .summary-col.actions { align-items: flex-start; }
                }

                .back-btn {
                    background: transparent;
                    border: none;
                    color: #666;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0;
                    transition: color 0.2s;
                }
                .back-btn:hover {
                    color: #1a1a1a;
                }
                .order-details-full {
                    padding: 10px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #eee;
                }
                .detail-row span:first-child {
                    color: #666;
                    font-weight: 500;
                }
                .order-items-minimal {
                    margin-top: 30px;
                }
                .order-items-minimal h4 {
                    margin-bottom: 15px;
                    border-bottom: 2px solid #1a1a1a;
                    display: inline-block;
                    padding-bottom: 5px;
                }
            `}</style>
        </div>
    );
};

export default MyOrders;
