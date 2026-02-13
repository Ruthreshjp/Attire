import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
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
import AdminCarousel from './pages/admin/AdminCarousel';
import AdminAbout from './pages/admin/AdminAbout';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
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
                    <Route path="/admin/carousel" element={<AdminCarousel />} />
                    <Route path="/admin/about" element={<AdminAbout />} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;
