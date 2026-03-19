import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import LiveEditHome from './pages/admin/LiveEditHome';
import LiveEditAbout from './pages/admin/LiveEditAbout';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import './App.css';
import ReviewPrompt from './components/ReviewPrompt';
import { NotificationProvider } from './context/NotificationContext';
import PremiumAlert from './components/PremiumAlert';
import PremiumConfirm from './components/PremiumConfirm';

const Products = lazy(() => import('./pages/Products'));
const OfferZone = lazy(() => import('./pages/OfferZone'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

// Error Boundary Section
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, info) { console.error("Crash Insight:", error, info); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#c5a059', padding: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3rem', marginBottom: '20px' }}>System Interruption</h1>
                    <p style={{ color: '#aaa', maxWidth: '500px', lineHeight: '1.6', marginBottom: '40px' }}>Our intelligence center encountered an unexpected anomaly while processing your request.</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '18px 45px', background: '#c5a059', color: '#000', border: 'none', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer' }}>Refresh Environment</button>
                    <p style={{ marginTop: '20px', color: '#333', fontSize: '0.7rem' }}>Error clearance code: ATTIRE-0X1A</p>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
        <NotificationProvider>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <div className="App">
                            <PremiumAlert />
                            <PremiumConfirm />
                            <ReviewPrompt />
                            <Suspense fallback={<div className="luxury-spinner" style={{ margin: '100px auto' }}></div>}>

                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/offer-zone" element={<OfferZone />} />
                                <Route path="/product/:id" element={<ProductDetail />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/my-orders" element={<MyOrders />} />
                                {/* Admin Routes */}
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/products" element={<AdminProducts />} />
                                <Route path="/admin/orders" element={<AdminOrders />} />
                                <Route path="/admin/edit/home" element={<LiveEditHome />} />
                                <Route path="/admin/edit/about" element={<LiveEditAbout />} />
                            </Routes>
                        </Suspense>
                    </div>
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    </NotificationProvider>
    </ErrorBoundary>
    );
}

export default App;

