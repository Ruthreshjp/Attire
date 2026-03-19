import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-brand" onClick={() => navigate('/admin')}>
                <div className="admin-logo-vessel">
                   <img src="/logo.png" alt="Attire" />
                </div>
                <div className="brand-info">
                    <h2>ATTIRE</h2>
                </div>
            </div>

            <div className="sidebar-scroll-area">
                <nav className="sidebar-nav-group">
                    <p className="group-title">Analytics & Flow</p>
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <div className="link-blob"></div>
                        <span className="link-icon">📈</span> 
                        <span className="link-text">Dashboard</span>
                    </NavLink>
                </nav>

                <nav className="sidebar-nav-group">
                    <p className="group-title">Inventory Control</p>
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <div className="link-blob"></div>
                        <span className="link-icon">💎</span> 
                        <span className="link-text">Collections</span>
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <div className="link-blob"></div>
                        <span className="link-icon">📜</span> 
                        <span className="link-text">Customer Orders</span>
                    </NavLink>
                </nav>

                <nav className="sidebar-nav-group">
                    <p className="group-title">Aesthetic Manager</p>
                    <NavLink to="/admin/edit/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <div className="link-blob"></div>
                        <span className="link-icon">🏛️</span> 
                        <span className="link-text">Home Page Edit</span>
                    </NavLink>
                    <NavLink to="/admin/edit/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <div className="link-blob"></div>
                        <span className="link-icon">✨</span> 
                        <span className="link-text">About Edit</span>
                    </NavLink>
                </nav>

                <nav className="sidebar-nav-group footer-links">
                    <NavLink to="/profile" className="nav-link profile-v-link">
                        <div className="admin-profile-meta">
                            <div className="admin-initial-vessel">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="admin-meta-info">
                                <span className="admin-u-name">{user?.name || 'Admin'}</span>
                                <span className="admin-u-role">Security Level: Gold</span>
                            </div>
                        </div>
                    </NavLink>
                    <NavLink to="/" className="nav-link storefront-link">
                        <span className="link-icon">🌐</span> 
                        <span className="link-text">Public Storefront</span>
                    </NavLink>
                </nav>
            </div>
        </aside>
    );
};

export default AdminSidebar;
