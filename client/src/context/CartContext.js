import React, { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = localStorage.getItem('cart');
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            // Filter out any stale/malformed items missing required fields
            return parsed.filter(item =>
                item && item.cartKey && typeof item.price === 'number' && item.name
            );
        } catch {
            return [];
        }
    });

    // Persist to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, selectedSize = '', selectedColor = '') => {
        const productId = product._id || product.id;
        const cartKey = `${productId}-${selectedSize}-${selectedColor}`;

        setCartItems(prev => {
            const existing = prev.find(item => item.cartKey === cartKey);
            if (existing) {
                return prev.map(item =>
                    item.cartKey === cartKey
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            const displayImage = product.images && product.images[0]
                ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                : product.image;

            return [...prev, {
                cartKey,
                id: productId,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: displayImage,
                size: selectedSize,
                color: selectedColor,
                quantity: 1,
                category: product.category,
            }];
        });
    };

    const removeFromCart = (cartKey) => {
        setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
    };

    const updateQuantity = (cartKey, change) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.cartKey === cartKey) {
                    const newQty = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const clearCart = () => setCartItems([]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
