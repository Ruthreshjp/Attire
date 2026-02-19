const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, cart: user.cart });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/cart
// @desc    Add item to cart or update quantity
// @access  Private
router.post('/', auth, async (req, res) => {
    const { productId, quantity, size, color } = req.body;

    try {
        const user = await User.findById(req.user.id);

        // Check if item already exists in cart with same size and color
        const existingItemIndex = user.cart.findIndex(item =>
            item.product.toString() === productId &&
            item.size === size &&
            item.color === color
        );

        if (existingItemIndex > -1) {
            // Update quantity
            user.cart[existingItemIndex].quantity += quantity || 1;
        } else {
            // Add new item
            user.cart.push({
                product: productId,
                quantity: quantity || 1,
                size,
                color
            });
        }

        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('cart.product');
        res.json({ success: true, cart: updatedUser.cart });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity
// @access  Private
router.put('/update', auth, async (req, res) => {
    const { productId, size, color, quantity } = req.body;

    try {
        const user = await User.findById(req.user.id);

        const itemIndex = user.cart.findIndex(item =>
            item.product.toString() === productId &&
            item.size === size &&
            item.color === color
        );

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity = quantity;
            await user.save();
            const updatedUser = await User.findById(req.user.id).populate('cart.product');
            res.json({ success: true, cart: updatedUser.cart });
        } else {
            res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/cart
// @desc    Remove item from cart
// @access  Private
router.delete('/', auth, async (req, res) => {
    const { productId, size, color } = req.body;

    try {
        const user = await User.findById(req.user.id);

        user.cart = user.cart.filter(item =>
            !(item.product.toString() === productId && item.size === size && item.color === color)
        );

        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('cart.product');
        res.json({ success: true, cart: updatedUser.cart });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = [];
        await user.save();
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
