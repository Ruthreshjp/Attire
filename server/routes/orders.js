const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            tax,
            shippingCost,
            total
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        const order = new Order({
            user: req.user.id,
            items: orderItems.map(item => ({
                product: item.id || item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            })),
            shippingAddress,
            paymentMethod,
            subtotal,
            tax,
            shippingCost,
            total
        });

        const createdOrder = await order.save();

        // Clear user's cart after successful order
        const user = await User.findById(req.user.id);
        user.cart = [];
        await user.save();

        res.status(201).json({ success: true, order: createdOrder });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders
// @desc    Get logged in user orders
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
        res.json({ success: true, orders });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order belongs to user
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
