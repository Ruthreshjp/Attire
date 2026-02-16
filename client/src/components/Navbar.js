import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


const Navbar = ({ onSearch, onFilter }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(0);
  const [wishlistCount] = useState(0);
  const [categories, setCategories] = useState(['Watches', 'Eyewear', 'Bags', 'Wallets', 'Ties', 'Cufflinks', 'Belts', 'Accessories']);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        if (data.success) {
          const uniqueCategories = [...new Set(data.products.map(p => p.category))];
          if (uniqueCategories.length > 0) {
            setCategories([...new Set([...categories, ...uniqueCategories])]);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    navigate(`/products?search=${searchQuery}`);
    setIsSearchOpen(false);
  };

  const handleFilter = (filterType, value) => {
    if (onFilter) {
      onFilter(filterType, value);
    }
    setIsFilterOpen(false);
  };

  const handleProtectedAction = (path) => {
    if (!user) {
      navigate('/login', { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Logo" className="logo-image" />
          <span className="logo-text">A T T I R E</span>
        </div>

        {/* Search Bar - Desktop */}
        <div className="navbar-search-desktop">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Filter Button Integrated with Search */}
            <div className="filter-dropdown">
              <button
                type="button"
                className="filter-icon-near-search"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                  <circle cx="7" cy="6" r="2" fill="currentColor" />
                  <circle cx="14" cy="12" r="2" fill="currentColor" />
                  <circle cx="17" cy="18" r="2" fill="currentColor" />
                </svg>
              </button>

              {isFilterOpen && (
                <div className="filter-dropdown-content">
                  <div className="filter-section">
                    <h4>Sort By Price</h4>
                    <button type="button" onClick={() => handleFilter('sort', 'price-low')}>
                      Price: Low to High
                    </button>
                    <button type="button" onClick={() => handleFilter('sort', 'price-high')}>
                      Price: High to Low
                    </button>
                  </div>

                  <div className="filter-section">
                    <h4>Category</h4>
                    {categories.map(cat => (
                      <button key={cat} type="button" onClick={() => handleFilter('category', cat.toLowerCase())}>
                        {cat}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="clear-filters"
                    onClick={() => handleFilter('clear', null)}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Navigation Links */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Shop</Link></li>
          <li><Link to="/about">About</Link></li>
          {user && user.role === 1 && <li><Link to="/admin">Dashboard</Link></li>}
        </ul>

        {/* Right Side Icons */}
        <div className="navbar-actions">
          {/* Mobile Search Toggle */}
          <button
            className="search-icon-mobile"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <div
            onClick={() => handleProtectedAction('/wishlist')}
            className="wishlist-icon"
            style={{ cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
          </div>

          <div
            onClick={() => handleProtectedAction('/cart')}
            className="cart-icon"
            style={{ cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>

          <div
            onClick={() => handleProtectedAction('/my-orders')}
            className="orders-icon"
            title="My Orders"
            style={{ cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>

          {user ? (
            <div className="user-nav-actions">
              <Link to="/profile" className="account-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="navbar-search-mobile">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
            <button type="submit" className="search-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
