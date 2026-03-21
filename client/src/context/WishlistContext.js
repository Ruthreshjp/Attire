import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [hasNewItems, setHasNewItems] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initial load - from local storage or server
    useEffect(() => {
        const loadWishlist = async () => {
            if (isAuthenticated) {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/wishlist`, {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    if (res.data.success) {
                        const serverWishlist = res.data.wishlist.map(item => ({
                            id: item._id || item,
                            name: item.name || 'Product',
                            price: item.price || 0,
                            originalPrice: item.originalPrice,
                            image: (item.images && item.images[0])
                                ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
                                : (item.image || ''),
                            category: item.category,
                            stock: item.stock || 0,
                            inStock: (item.stock || 0) > 0,
                        }));
                        setWishlistItems(serverWishlist);
                    }
                } catch (err) {
                    console.error('Error fetching wishlist:', err);
                    if (err.response && err.response.status === 401) {
                        // Token expired or invalid, clear server-side state
                        setWishlistItems([]);
                    }
                }
            } else {
                // Not authenticated - loaded from local storage
                const stored = localStorage.getItem('wishlist');
                if (stored) {
                    try {
                        setWishlistItems(JSON.parse(stored));
                    } catch (e) {
                        setWishlistItems([]);
                    }
                } else {
                    setWishlistItems([]);
                }
            }
            setLoading(false);
        };

        loadWishlist();
    }, [isAuthenticated]);

    // Persist to localStorage for guests
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            localStorage.setItem('wishlist_new', hasNewItems ? 'true' : 'false');
        }
    }, [wishlistItems, hasNewItems, isAuthenticated]);

    const addToWishlist = async (product) => {
        const productId = product._id || product.id;

        if (isAuthenticated) {
            try {
                const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/wishlist/${productId}`, {}, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    const serverWishlist = res.data.wishlist.map(item => ({
                        id: item._id || item,
                        name: item.name || 'Product',
                        price: item.price || 0,
                        originalPrice: item.originalPrice,
                        image: (item.images && item.images[0])
                            ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
                            : (item.image || ''),
                        category: item.category,
                        stock: item.stock || 0,
                        inStock: (item.stock || 0) > 0,
                    }));
                    setWishlistItems(serverWishlist);
                    setHasNewItems(true);
                }
            } catch (err) {
                console.error('Error adding to server wishlist:', err);
                if (err.response && err.response.status === 401) {
                    // Fallback to local storage addition if unauthorized
                    const productId = product._id || product.id;
                    setWishlistItems(prev => {
                        if (prev.find(item => item.id.toString() === productId.toString())) return prev;
                        setHasNewItems(true);
                        const displayImage = product.images && product.images[0]
                            ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                            : product.image;

                        return [...prev, {
                            id: productId.toString(),
                            name: product.name,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            image: displayImage,
                            category: product.category,
                            stock: product.stock,
                            inStock: (product.stock || 0) > 0,
                        }];
                    });
                }
            }
        } else {
            setWishlistItems(prev => {
                if (prev.find(item => item.id.toString() === productId.toString())) return prev;
                setHasNewItems(true);
                const displayImage = product.images && product.images[0]
                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                    : product.image;

                return [...prev, {
                    id: productId.toString(),
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: displayImage,
                    category: product.category,
                    stock: product.stock,
                    inStock: (product.stock || 0) > 0,
                }];
            });
        }
    };

    const removeFromWishlist = async (idToRemove) => {
        if (!idToRemove) return;
        const targetId = idToRemove.toString();

        if (isAuthenticated) {
            try {
                const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/wishlist/${targetId}`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    setWishlistItems(prev => prev.filter(item => item.id.toString() !== targetId));
                }
            } catch (err) {
                console.error('Error removing from server wishlist:', err);
                // Fallback to local filtering if server fails
                setWishlistItems(prev => prev.filter(item => item.id.toString() !== targetId));
            }
        } else {
            setWishlistItems(prev => prev.filter(item => item.id.toString() !== targetId));
        }
    };

    const toggleWishlist = (product) => {
        const productId = product._id || product.id;
        if (isWishlisted(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(product);
        }
    };

    const isWishlisted = (productId) => {
        if (!productId) return false;
        const targetId = productId.toString();
        return wishlistItems.some(item => item.id.toString() === targetId);
    };

    const markSeen = () => {
        setHasNewItems(false);
    };

    const wishlistCount = wishlistItems.length;

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isWishlisted,
            wishlistCount,
            hasNewItems,
            markSeen,
            loading
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
