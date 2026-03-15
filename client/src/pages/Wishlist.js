import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import useScrollAnimation from '../utils/useScrollAnimation';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist, markSeen } = useWishlist();
    const { addToCart } = useCart();
    useScrollAnimation();

    useEffect(() => { markSeen(); }, [markSeen]);

    const handleMoveToCart = (item) => {
        addToCart(item);
        removeFromWishlist(item.id);
    };

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#fff' }}>
            <Navbar />

            {/* ── HEADER ── */}
            <div style={{ padding: '70px 8% 50px', borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                <p className="anim fade" style={{ fontSize: '0.65rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '10px' }}>Saved Items</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
                    <h1 className="anim from-left" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,5vw,4.5rem)', lineHeight: 1 }}>
                        My Wishlist
                    </h1>
                    <p className="anim from-right" style={{ color: '#aaa', fontSize: '0.85rem', alignSelf: 'flex-end' }}>
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                    </p>
                </div>
            </div>

            <div style={{ padding: '60px 8%' }}>
                {wishlistItems.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px 30px' }}>
                        {wishlistItems.map((item, i) => (
                            <div
                                key={item.id}
                                className={`anim from-bottom delay-${Math.min(i % 4 + 1, 8)}`}
                                style={{ background: '#fff', border: '1px solid #f0f0f0', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                                onMouseOver={e => { e.currentTarget.style.borderColor = '#c5a059'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.06)'; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {/* Image */}
                                <div style={{ position: 'relative', overflow: 'hidden', background: '#f5f5f5', cursor: 'pointer' }}
                                    onClick={() => navigate(`/product/${item.id}`)}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block', transition: 'transform 1.2s cubic-bezier(0.19,1,0.22,1)' }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'none'}
                                    />
                                    {/* Remove btn */}
                                    <button
                                        onClick={e => { e.stopPropagation(); removeFromWishlist(item.id); }}
                                        style={{
                                            position: 'absolute', top: '12px', right: '12px',
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: '#fff', border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000', transition: '0.3s'
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#c5a059'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                                        title="Remove"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                                {/* Info */}
                                <div style={{ padding: '20px' }}>
                                    <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#c5a059', fontWeight: 700, marginBottom: '6px' }}>{item.category}</p>
                                    <h3 onClick={() => navigate(`/product/${item.id}`)} style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', cursor: 'pointer', transition: 'color 0.3s' }}
                                        onMouseOver={e => e.currentTarget.style.color = '#c5a059'}
                                        onMouseOut={e => e.currentTarget.style.color = '#000'}
                                    >{item.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{(item.price || 0).toLocaleString('en-IN')}</span>
                                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: item.inStock !== false ? '#e6ffed' : '#fff1f0', color: item.inStock !== false ? '#166534' : '#b91c1c', fontWeight: 700 }}>
                                            {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleMoveToCart(item)}
                                        style={{
                                            width: '100%', padding: '13px', background: '#000',
                                            color: '#c5a059', fontSize: '0.7rem', fontWeight: 800,
                                            letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                                            transition: 'background 0.3s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#c5a059'}
                                        onMouseOut={e => e.currentTarget.style.background = '#000'}
                                    >
                                        Move to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.5rem', color: '#000' }}>Your Wishlist is Empty</h2>
                        <p style={{ color: '#aaa', fontSize: '1rem', maxWidth: '380px', lineHeight: 1.7 }}>
                            Save pieces you love to your wishlist and revisit them anytime.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            style={{ padding: '16px 44px', background: '#000', color: '#c5a059', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginTop: '10px' }}
                        >
                            Explore Collection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
