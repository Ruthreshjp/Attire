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
            total,
            expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order by user and add bank details
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const { accountName, accountNumber, ifscCode } = req.body;
        
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check user ownership
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check if cancellable (e.g. within 2 days of creation)
        const orderDate = new Date(order.createdAt);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 2) {
            return res.status(400).json({ success: false, message: 'Order can only be cancelled within 2 days of placement' });
        }
        
        if (order.orderStatus === 'cancelled') {
             return res.status(400).json({ success: false, message: 'Order is already cancelled' });
        }

        order.orderStatus = 'cancelled';
        order.cancelledAt = new Date();
        
        // Setup refund details
        order.refundDetails = {
            accountName,
            accountNumber,
            ifscCode,
            refundStatus: 'pending',
            refundAmount: order.total > 50 ? order.total - 50 : 0
        };

        await order.save();

        res.json({ success: true, message: 'Order cancelled successfully. Refund initiated processing.', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
