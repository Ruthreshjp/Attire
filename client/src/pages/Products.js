import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import useScrollAnimation from '../utils/useScrollAnimation';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [view, setView] = useState('grid'); // 'grid' | 'list'

    useScrollAnimation();

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.products);
                    // Removed setFilteredProducts(data.products) to let useEffect handle URL filtering
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        let filtered = [...products];

        if (category) {
            setSelectedCategory(category);
            filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        } else {
            setSelectedCategory('');
        }
        
        if (search) {
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(search.toLowerCase()) ||
                p.category?.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredProducts(filtered);
    }, [searchParams, products]);

    const handleSearch = (query) => {
        if (!query) { setFilteredProducts(products); return; }
        setFilteredProducts(products.filter(p =>
            p.name?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.toLowerCase().includes(query.toLowerCase())
        ));
    };

    const handleFilter = (filterType, value) => {
        if (filterType === 'category') {
            const newParams = new URLSearchParams(searchParams);
            if (!value || value === 'all') {
                newParams.delete('category');
            } else {
                newParams.set('category', value);
            }
            // Keep search if present
            setSearchParams(newParams);
        } else if (filterType === 'sort') {
            let sorted = [...filteredProducts];
            if (value === 'price-low') { sorted.sort((a, b) => a.price - b.price); setSortBy('Price: Low to High'); }
            else if (value === 'price-high') { sorted.sort((a, b) => b.price - a.price); setSortBy('Price: High to Low'); }
            setFilteredProducts(sorted);
        } else if (filterType === 'clear') {
            setSearchParams({});
            setSortBy('');
        }
    };

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#fff' }}>
            <Navbar onSearch={handleSearch} onFilter={handleFilter} />

            {/* ── PAGE HEADER ── */}
            <div style={{
                padding: '70px 8% 50px',
                borderBottom: '1px solid #e8e8e8',
                background: '#fafafa'
            }}>
                <p className="anim fade" style={{ fontSize: '0.65rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '10px' }}>
                    {selectedCategory ? 'Category' : 'Our Collection'}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <h1 className="anim from-left" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,5vw,4.5rem)', lineHeight: 1 }}>
                        {selectedCategory || 'All Products'}
                    </h1>
                    <p className="anim from-right" style={{ color: '#aaa', fontSize: '0.85rem', alignSelf: 'flex-end' }}>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                    </p>
                </div>
            </div>

            {/* ── FILTER BAR ── */}
            <div style={{
                padding: '18px 8%', borderBottom: '1px solid #e8e8e8',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px', background: '#fff', position: 'sticky', top: '80px', zIndex: 100
            }}>
                {/* Category Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginRight: '8px', fontWeight: 700 }}>Filter:</span>
                    {['', ...categories].map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => handleFilter('category', cat)}
                            style={{
                                padding: '7px 18px',
                                border: `1px solid ${(!cat && !selectedCategory) || selectedCategory === cat ? '#000' : '#e8e8e8'}`,
                                background: (!cat && !selectedCategory) || selectedCategory === cat ? '#000' : 'transparent',
                                color: (!cat && !selectedCategory) || selectedCategory === cat ? '#c5a059' : '#666',
                                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px',
                                cursor: 'pointer', transition: '0.3s', textTransform: 'uppercase'
                            }}
                        >
                            {cat || 'All'}
                        </button>
                    ))}
                </div>
                {/* Sort + View */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                        onChange={e => handleFilter('sort', e.target.value)}
                        style={{
                            padding: '8px 16px', border: '1px solid #e8e8e8', background: '#fff',
                            fontSize: '0.8rem', color: '#333', cursor: 'pointer'
                        }}
                    >
                        <option value="">Sort By</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => setView('grid')} style={{ padding: '8px', border: `1px solid ${view === 'grid' ? '#000' : '#e8e8e8'}`, background: view === 'grid' ? '#000' : 'transparent', cursor: 'pointer' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={view === 'grid' ? '#c5a059' : '#999'}>
                                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                            </svg>
                        </button>
                        <button onClick={() => setView('list')} style={{ padding: '8px', border: `1px solid ${view === 'list' ? '#000' : '#e8e8e8'}`, background: view === 'list' ? '#000' : 'transparent', cursor: 'pointer' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={view === 'list' ? '#c5a059' : '#999'}>
                                <rect x="3" y="4" width="18" height="3" /><rect x="3" y="10" width="18" height="3" /><rect x="3" y="16" width="18" height="3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── PRODUCTS ── */}
            <div style={{ padding: '50px 8%', minHeight: '60vh' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '20px' }}>
                        <div style={{ width: '36px', height: '36px', border: '2px solid #f0f0f0', borderTop: '2px solid #c5a059', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ color: '#aaa', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Loading Collection</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1" style={{ margin: '0 auto 24px' }}>
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', marginBottom: '12px' }}>No Products Found</h3>
                        <p style={{ color: '#aaa', marginBottom: '32px' }}>Try adjusting your filters or search query</p>
                        <button onClick={() => handleFilter('clear', null)} style={{ padding: '14px 36px', background: '#000', color: '#c5a059', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: view === 'grid' ? 'grid' : 'flex',
                        gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                        flexDirection: view === 'list' ? 'column' : undefined,
                        gap: view === 'grid' ? '40px 30px' : '2px'
                    }}>
                        {filteredProducts.map((product, i) => (
                            <div key={product._id || product.id} className={`anim from-bottom delay-${Math.min(i % 4 + 1, 8)}`}
                                style={view === 'list' ? { border: '1px solid #e8e8e8' } : {}}>
                                {view === 'grid' ? (
                                    <ProductCard product={product} />
                                ) : (
                                    // List view
                                    <div style={{ display: 'flex', gap: '30px', padding: '24px', alignItems: 'center', background: '#fff', cursor: 'pointer' }}
                                        onClick={() => window.location.href = `/product/${product._id}`}>
                                        <img
                                            src={(() => {
                                                const img = product.images?.[0] || product.image;
                                                if (!img) return 'https://via.placeholder.com/100x130?text=No+Img';
                                                const url = typeof img === 'string' ? img : (img.url || '');
                                                if (url.startsWith('http') || url.startsWith('data:')) return url;
                                                return `http://localhost:5000/${url}`;
                                            })()}
                                            alt={product.name}
                                            style={{ width: '100px', height: '130px', objectFit: 'cover', flexShrink: 0 }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100x130?text=Error'; }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '6px' }}>{product.category}</p>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>{product.name}</h3>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{(product.price || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Products;
