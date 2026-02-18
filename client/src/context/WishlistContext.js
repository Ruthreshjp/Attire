import React, { createContext, useState, useEffect, useContext } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const stored = localStorage.getItem('wishlist');
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            // Filter out stale/malformed items
            return parsed.filter(item =>
                item && item.id && item.name && typeof item.price === 'number'
            );
        } catch {
            return [];
        }
    });

    const [hasNewItems, setHasNewItems] = useState(() => {
        return localStorage.getItem('wishlist_new') === 'true';
    });

    // Persist to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    useEffect(() => {
        localStorage.setItem('wishlist_new', hasNewItems ? 'true' : 'false');
    }, [hasNewItems]);

    const addToWishlist = (product) => {
        const productId = product._id || product.id;
        const displayImage = product.images && product.images[0]
            ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
            : product.image;

        setWishlistItems(prev => {
            if (prev.find(item => item.id === productId)) return prev; // already in wishlist
            setHasNewItems(true);
            return [...prev, {
                id: productId,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: displayImage,
                category: product.category,
                stock: product.stock,
                inStock: (product.stock || 0) > 0,
            }];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
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
        return wishlistItems.some(item => item.id === productId);
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
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
