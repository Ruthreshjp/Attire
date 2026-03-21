import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ forceDark = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useCart();
  const { hasNewItems } = useWishlist();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const navClass = `premium-nav ${isScrolled ? 'scrolled' : ''} ${forceDark && !isScrolled ? 'force-dark' : ''}`;

  return (
    <nav className={navClass}>
      <div className="nav-wrapper">
        
        {/* LEFT: Logo & Brand */}
        <div className="nav-left">
          <div className="brand-box" onClick={() => navigate('/')}>
             <img src="/logo.png" alt="A" className="nav-logo-icon" />
             <span className="nav-logo-text">ATTIRE</span>
          </div>
        </div>

        {/* CENTER: Nav Links */}
        <div className="nav-center">
          <ul className="nav-links">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
            <li><Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Collections</Link></li>
            <li><Link to="/offer-zone" className={location.pathname === '/offer-zone' ? 'active' : ''}>Offer Zone</Link></li>
            <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link></li>
          </ul>
        </div>

        {/* RIGHT: Actions */}
        <div className="nav-right">
          <form className="nav-search-container" onSubmit={handleSearch}>
            <div className="search-bar">
               <input 
                 type="text" 
                 placeholder="Search styles..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <button type="submit" className="search-icon-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
               </button>
            </div>
          </form>

          <div className="action-icons">
            <Link to="/wishlist" className="icon-btn" title="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {hasNewItems && <span className="dot" />}
            </Link>

            <Link to="/cart" className="icon-btn" title="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            {user ? (
               <div className="user-dropdown">
                  <div className="profile-trigger">
                     <span className="profile-name">{user.name.split(' ')[0]}</span>
                     <div className="nav-profile-initial">
                        {user.name.charAt(0).toUpperCase()}
                     </div>
                  </div>
                  <div className="dropdown-menu">
                     <div className="dropdown-header">
                        <strong>{user.name}</strong>
                        <span>Member Since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024'}</span>
                     </div>
                     <div className="dropdown-links">
                        <Link to="/profile">
                           <div className="drop-link-icon">⚙️</div>
                           <span>Account Settings</span>
                        </Link>
                        <Link to="/my-orders">
                           <div className="drop-link-icon">📦</div>
                           <span>Order History</span>
                        </Link>
                        {user.role === 1 && (
                           <Link to="/admin" className="admin-link">
                              <div className="drop-link-icon">⚡</div>
                              <span>Admin Dashboard</span>
                           </Link>
                        )}
                        <button onClick={logout} className="logout-action">
                           <div className="drop-link-icon">🚪</div>
                           <span>Sign Out</span>
                        </button>
                     </div>
                  </div>
               </div>
            ) : (
               <Link to="/login" className="nav-login-btn">Sign In</Link>
            )}
          </div>
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`burger ${isMenuOpen ? 'open' : ''}`}></div>
          </button>
        </div>
      </div>

      <div className={`mobile-nav-overlay ${isMenuOpen ? 'active' : ''}`}>
          <button className="mobile-close" onClick={() => setIsMenuOpen(false)}>&times;</button>
          <ul className="mobile-links">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/products" onClick={() => setIsMenuOpen(false)}>Collections</Link></li>
            <li><Link to="/offer-zone" onClick={() => setIsMenuOpen(false)}>Offer Zone</Link></li>
            <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
            {user ? (
               <>
                 <li className="sep"></li>
                  <li><Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile Settings</Link></li>
                  <li><Link to="/my-orders" onClick={() => setIsMenuOpen(false)}>Order History</Link></li>
                  {user.role === 1 && (
                     <li><Link to="/admin" onClick={() => setIsMenuOpen(false)} style={{ color: '#c5a059' }}>Admin Dashboard</Link></li>
                  )}
                  <li><button onClick={logout}>Sign Out</button></li>
               </>
            ) : (
               <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link></li>
            )}
          </ul>
      </div>

      <style>{`
        .premium-nav {
          position: fixed; top: 0; left: 0; right: 0; height: 100px;
          background: rgba(255,255,255,0.05); z-index: 1000;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          border-bottom: 1px solid transparent;
        }
        .premium-nav.scrolled, .premium-nav.force-dark {
          background: rgba(0,0,0,0.95);
          backdrop-filter: blur(15px); border-bottom: 1px solid rgba(197,160,89,0.3);
        }
        .premium-nav.scrolled { height: 80px; }

        .premium-nav.scrolled .nav-links a, 
        .premium-nav.force-dark .nav-links a,
        .premium-nav.scrolled .nav-logo-text,
        .premium-nav.force-dark .nav-logo-text,
        .premium-nav.scrolled .icon-btn,
        .premium-nav.force-dark .icon-btn,
        .premium-nav.scrolled .profile-name,
        .premium-nav.force-dark .profile-name,
        .premium-nav.scrolled .search-bar input,
        .premium-nav.force-dark .search-bar input { color: #fff; }

        .premium-nav.scrolled .nav-search-container,
        .premium-nav.force-dark .nav-search-container { background: rgba(255,255,255,0.1); border: none; }
        .premium-nav.scrolled .nav-search-container input::placeholder,
        .premium-nav.force-dark .nav-search-container input::placeholder { color: rgba(255,255,255,0.5); }
        .premium-nav.scrolled .nav-logo-icon,
        .premium-nav.force-dark .nav-logo-icon { filter: none; }

        .nav-wrapper {
          display: flex; align-items: center; justify-content: space-between;
          height: 100%; padding: 0 5%; max-width: 1920px; margin: 0 auto;
        }

        /* LEFT: BRAND */
        .nav-left { flex: 0 0 20%; }
        .brand-box { display: flex; align-items: center; gap: 14px; cursor: pointer; transition: transform 0.3s; }
        .brand-box:hover { transform: translateX(5px); }
        .nav-logo-icon { width: 38px; height: 38px; object-fit: contain; }
        .nav-logo-text { 
           font-family: 'Playfair Display', serif; font-size: 1.8rem; 
           letter-spacing: 4px; font-weight: 900; color: #000;
           transition: color 0.3s;
        }

        /* CENTER: LINKS */
        .nav-center { flex: 1; display: flex; justify-content: center; }
        .nav-links { display: flex; gap: 45px; list-style: none; }
        .nav-links a { 
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase; 
          letter-spacing: 2.5px; color: #000; transition: all 0.3s;
          position: relative; padding: 10px 0;
        }
        .nav-links a.active { color: #c5a059; }
        .nav-links a::after {
          content: ''; position: absolute; bottom: 0; left: 50%; width: 0;
          height: 2px; background: #c5a059; transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          transform: translateX(-50%);
        }
        .nav-links a:hover { color: #c5a059; }
        .nav-links a:hover::after { width: 30px; }

        /* RIGHT: ACTIONS */
        .nav-right { flex: 0 0 35%; display: flex; align-items: center; justify-content: flex-end; gap: 30px; }
        
        .nav-search-container {
           background: #f8f8f8; padding: 10px 18px; border-radius: 4px; border: 1px solid #eee;
           transition: all 0.3s; width: 220px;
        }
        .nav-search-container:focus-within { width: 300px; background: #fff; border-color: #c5a059; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .search-bar { display: flex; align-items: center; gap: 10px; }
        .search-bar input { 
           border: none; background: transparent; font-size: 0.8rem; color: #000; 
           width: 100%; outline: none; font-weight: 500;
        }
        .search-icon-btn { background: none; border: none; padding: 0; cursor: pointer; color: #aaa; transition: color 0.3s; }
        .search-icon-btn:hover { color: #c5a059; }

        .action-icons { display: flex; align-items: center; gap: 20px; }
        .icon-btn { position: relative; color: #000; transition: all 0.3s; }
        .icon-btn:hover { color: #c5a059; transform: translateY(-2px); }
        .icon-btn .dot { 
          position: absolute; top: -2px; right: -2px; width: 8px; height: 8px;
          background: #c5a059; border-radius: 50%; border: 2px solid #fff;
        }
        .icon-btn .badge {
          position: absolute; top: -10px; right: -10px; background: #c5a059;
          color: #000; font-size: 0.65rem; font-weight: 900; width: 18px;
          height: 18px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 4px 10px rgba(197,160,89,0.3);
        }

        .nav-profile-initial {
          width: 32px; height: 32px; background: #c5a059; color: #000;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; font-family: 'Playfair Display', serif;
          font-size: 0.9rem; font-weight: 800; border: 1px solid #000;
        }
        .premium-nav.scrolled .nav-profile-initial,
        .premium-nav.force-dark .nav-profile-initial { background: #c5a059; color: #000; border-color: #fff; }

        .user-dropdown { position: relative; cursor: pointer; }
        .profile-trigger { display: flex; align-items: center; gap: 12px; }
        .profile-name { font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; color: #000; text-transform: uppercase; }
        
        .dropdown-menu {
          position: absolute; top: calc(100% + 15px); right: -10px; width: 280px;
          background: #fff; transform: translateY(15px); opacity: 0; visibility: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.15); border: 1px solid #f0f0f0; border-radius: 12px;
          z-index: 1000; overflow: hidden;
        }
        .user-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
        
        .dropdown-header { padding: 25px 30px; border-bottom: 1px solid #f5f5f5; background: #fafafa; display: flex; flex-direction: column; gap: 4px; }
        .dropdown-header strong { color: #000; font-family: 'Playfair Display', serif; font-size: 1.1rem; }
        .dropdown-header span { color: #aaa; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        
        .dropdown-links { padding: 15px 10px; display: flex; flex-direction: column; }
        .dropdown-links a, .dropdown-links button {
          display: flex; align-items: center; gap: 15px; padding: 12px 20px;
          color: #444; font-size: 0.85rem; font-weight: 600; text-decoration: none;
          transition: all 0.2s; border-radius: 8px; border: none; background: none; width: 100%;
          text-align: left;
        }
        .dropdown-links a:hover, .dropdown-links button:hover { background: #fdfaf2; color: #c5a059; }
        .drop-link-icon { font-size: 1rem; width: 24px; display: flex; justify-content: center; }
        .admin-link { color: #c5a059 !important; border-top: 1px solid #f5f5f5; margin-top: 5px; padding-top: 15px !important; }
        .logout-action { color: #b91c1c !important; border-top: 1px solid #f5f5f5; margin-top: 5px; padding-top: 15px !important; }

        .nav-login-btn {
           padding: 10px 25px; background: #000; color: #c5a059;
           font-size: 0.7rem; font-weight: 800; letter-spacing: 2px;
           text-transform: uppercase; transition: all 0.3s; border-radius: 2px;
        }
        .nav-login-btn:hover { background: #c5a059; color: #000; }

        .mobile-toggle { display: none; }

        @media(max-width: 1200px) {
           .profile-name { display: none; }
           .nav-search-container { width: 180px; }
           .nav-center { display: none; }
           .mobile-toggle { display: block; background: none; border: none; margin-left:10px; padding: 10px; cursor: pointer; }
           .burger { width: 26px; height: 1.5px; background: #000; position: relative; }
           .burger::before, .burger::after { content: ''; position: absolute; width: 100%; height: 1.5px; background: #000; }
           .burger::before { top: -8px; }
           .burger::after { top: 8px; }
           .premium-nav.scrolled .burger, .premium-nav.scrolled .burger::before, .premium-nav.scrolled .burger::after { background: #fff; }
        }

        /* MOBILE OVERLAY STYLES */
        .mobile-nav-overlay {
          position: fixed; inset: 0; background: #000; z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; visibility: hidden; transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .mobile-nav-overlay.active { opacity: 1; visibility: visible; }
        
        .mobile-close {
          position: absolute; top: 40px; right: 40px; background: none;
          border: none; color: #fff; font-size: 3rem; cursor: pointer;
          line-height: 1; transition: transform 0.3s;
        }
        .mobile-close:hover { color: #c5a059; transform: rotate(90deg); }

        .mobile-links { list-style: none; text-align: center; padding: 0; }
        .mobile-links li { margin: 25px 0; overflow: hidden; }
        .mobile-links li.sep { height: 1px; background: rgba(197,160,89,0.2); width: 40px; margin: 30px auto; }
        
        .mobile-links a, .mobile-links button { 
          font-family: 'Playfair Display', serif; font-size: 2.5rem; 
          color: #fff; font-weight: 700; background: none; border: none;
          text-decoration: none; display: block; transition: all 0.3s;
          letter-spacing: 2px;
        }
        .mobile-links a:hover, .mobile-links button:hover { color: #c5a059; transform: scale(1.1); }
      `}</style>
    </nav>
  );
};

export default Navbar;
