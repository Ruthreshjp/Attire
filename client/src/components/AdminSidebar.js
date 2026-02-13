import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const navigate = useNavigate();
    return (
        <aside className="admin-sidebar">
            <div className="admin-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <img src="/logo.png" alt="Logo" className="logo-image" style={{ marginBottom: '15px' }} />
                <h2 className="logo-text" style={{ fontSize: '1.2rem', letterSpacing: '4px' }}>A T T I R E <span style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', letterSpacing: '2px', color: '#666', webkitTextFillColor: '#666' }}>ADMIN</span></h2>
            </div>
            <nav className="admin-nav">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon">📊</span>
                    Dashboard
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon">📦</span>
                    Products
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon">📜</span>
                    Orders
                </NavLink>
                <NavLink to="/admin/carousel" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon">🖼️</span>
                    Edit Home Page
                </NavLink>
                <NavLink to="/admin/about" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon">ℹ️</span>
                    Manage About
                </NavLink>
                <NavLink to="/profile" className="nav-item">
                    <span className="icon">👤</span>
                    Admin Profile
                </NavLink>

                <div className="sidebar-divider"></div>

                <NavLink to="/" className="nav-item back-btn">
                    <span className="icon">🏠</span>
                    Storefront
                </NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
