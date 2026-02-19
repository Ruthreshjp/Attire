import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load - from local storage or server
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                try {
                    const res = await axios.get('http://localhost:5000/api/cart', {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                    });
                    if (res.data.success) {
                        const serverCart = res.data.cart.map(item => ({
                            cartKey: `${item.product._id}-${item.size}-${item.color}`,
                            id: item.product._id,
                            name: item.product.name,
                            price: item.product.price,
                            originalPrice: item.product.originalPrice,
                            image: (item.product.images && item.product.images[0])
                                ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url)
                                : item.product.image,
                            size: item.size,
                            color: item.color,
                            quantity: item.quantity,
                            category: item.product.category,
                            isSpecialOffer: item.product.isSpecialOffer,
                            couponCode: item.product.couponCode,
                            extraDiscount: item.product.extraDiscount,
                            specialPrice: item.product.specialPrice,
                            discount: item.product.discount
                        }));
                        setCartItems(serverCart);
                    }
                } catch (err) {
                    console.error('Error fetching cart:', err);
                }
            } else {
                // Not authenticated - loaded from local storage (kept as guest cart)
                const stored = localStorage.getItem('cart');
                if (stored) {
                    try {
                        setCartItems(JSON.parse(stored));
                    } catch (e) {
                        setCartItems([]);
                    }
                } else {
                    setCartItems([]);
                }
            }
            setLoading(false);
        };

        loadCart();
    }, [isAuthenticated]);

    // Persist to localStorage for guests
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } else {
            // Should we clear the guest cart when logged in? 
            // Usually, we might want to merge them, but for now let's just keep them separate
            // and clear the 'cart' key if it was a guest cart.
        }
    }, [cartItems, isAuthenticated]);

    const addToCart = async (product, selectedSize = '', selectedColor = '') => {
        const productId = product._id || product.id;

        // Use first available color name if none selected
        let finalColor = selectedColor;
        if (!finalColor && product.colors && product.colors.length > 0) {
            finalColor = product.colors[0].name || product.colors[0];
        }

        // Use first available size if none selected
        let finalSize = selectedSize;
        if (!finalSize && product.sizes && product.sizes.length > 0) {
            finalSize = product.sizes[0];
        }

        const cartKey = `${productId}-${finalSize}-${finalColor}`;

        if (isAuthenticated) {
            try {
                const res = await axios.post('http://localhost:5000/api/cart', {
                    productId,
                    quantity: 1,
                    size: finalSize,
                    color: finalColor
                }, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });

                if (res.data.success) {
                    // Refresh data from server response
                    const serverCart = res.data.cart.map(item => ({
                        cartKey: `${item.product._id}-${item.size}-${item.color}`,
                        id: item.product._id,
                        name: item.product.name,
                        price: item.product.price,
                        originalPrice: item.product.originalPrice,
                        image: (item.product.images && item.product.images[0])
                            ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url)
                            : item.product.image,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity,
                        category: item.product.category,
                        isSpecialOffer: item.product.isSpecialOffer,
                        couponCode: item.product.couponCode,
                        extraDiscount: item.product.extraDiscount,
                        specialPrice: item.product.specialPrice,
                        discount: item.product.discount
                    }));
                    setCartItems(serverCart);
                }
            } catch (err) {
                console.error('Error adding to server cart:', err);
            }
        } else {
            // Local state for guests
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
                    size: finalSize,
                    color: finalColor,
                    quantity: 1,
                    category: product.category,
                    isSpecialOffer: product.isSpecialOffer,
                    couponCode: product.couponCode,
                    extraDiscount: product.extraDiscount,
                    specialPrice: product.specialPrice,
                    discount: product.discount
                }];
            });
        }
    };

    const removeFromCart = async (cartKey) => {
        if (isAuthenticated) {
            const item = cartItems.find(i => i.cartKey === cartKey);
            if (!item) return;

            try {
                const res = await axios.delete('http://localhost:5000/api/cart', {
                    data: { productId: item.id, size: item.size, color: item.color },
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    setCartItems(prev => prev.filter(i => i.cartKey !== cartKey));
                }
            } catch (err) {
                console.error('Error removing from server cart:', err);
            }
        } else {
            setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
        }
    };

    const updateQuantity = async (cartKey, change) => {
        const item = cartItems.find(i => i.cartKey === cartKey);
        if (!item) return;
        const newQty = Math.max(1, item.quantity + change);

        if (isAuthenticated) {
            try {
                const res = await axios.put('http://localhost:5000/api/cart/update', {
                    productId: item.id,
                    size: item.size,
                    color: item.color,
                    quantity: newQty
                }, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.data.success) {
                    setCartItems(prev =>
                        prev.map(i => i.cartKey === cartKey ? { ...i, quantity: newQty } : i)
                    );
                }
            } catch (err) {
                console.error('Error updating server cart quantity:', err);
            }
        } else {
            setCartItems(prev =>
                prev.map(i => {
                    if (i.cartKey === cartKey) {
                        return { ...i, quantity: newQty };
                    }
                    return i;
                })
            );
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await axios.delete('http://localhost:5000/api/cart/clear', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setCartItems([]);
            } catch (err) {
                console.error('Error clearing server cart:', err);
            }
        } else {
            setCartItems([]);
        }
    };

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
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
