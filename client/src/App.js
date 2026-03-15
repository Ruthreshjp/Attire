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

const Products = lazy(() => import('./pages/Products'));
const OfferZone = lazy(() => import('./pages/OfferZone'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

// Route-change loader
const RouteLoader = () => {
    const location = useLocation();
    const [show, setShow] = useState(false);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        setShow(true);
        setFade(false);
        const t1 = setTimeout(() => setFade(true), 600);
        const t2 = setTimeout(() => setShow(false), 1000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [location.pathname]);

    if (!show) return null;

    return (
        <div className={`page-loader${fade ? ' fade-out' : ''}`} style={{ position: 'fixed', zIndex: 99999 }}>
            <img src="/logo.png" alt="Attire" className="loader-logo" />
            <p className="loader-wordmark">A T T I R E</p>
            <div className="loader-bar"><div className="loader-progress" /></div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <div className="App">
                        <RouteLoader />
                        <ReviewPrompt />
                        <Suspense fallback={<div />}>
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
    );
}

export default App;
