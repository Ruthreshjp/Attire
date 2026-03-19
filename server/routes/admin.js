const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   POST /api/admin/products
// @desc    Add new product
// @access  Private/Admin
router.post('/products', async (req, res) => {
    res.json({ message: 'Add product - To be implemented' });
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/products/:id', async (req, res) => {
    res.json({ message: 'Update product - To be implemented' });
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/products/:id', async (req, res) => {
    res.json({ message: 'Delete product - To be implemented' });
});

// @route   POST /api/admin/carousel
// @desc    Add carousel slide
// @access  Private/Admin
router.post('/carousel', async (req, res) => {
    res.json({ message: 'Add carousel - To be implemented' });
});

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics & full data for frontend aggregation
// @access  Private/Admin
router.get('/dashboard', auth, adminAuth, async (req, res) => {
    try {
        const products = await Product.find().select('category name');
        const users = await User.find({ role: 0 }).select('name email createdAt lastLogin');
        
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'category name');

        console.log(`Dashboard Data: ${products.length} products, ${users.length} users, ${orders.length} orders`);
        res.json({
            success: true,
            products,
            users,
            orders
        });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Private/Admin
router.get('/orders', auth, adminAuth, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        const formattedOrders = orders.map(order => ({
            id: order.orderNumber,
            _id: order._id, // Added _id
            user: order.user ? order.user.name : order.shippingAddress.name,
            amount: order.total,
            status: order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid', 
            orderStatus: order.orderStatus,
            refundDetails: order.refundDetails, // Added refundDetails
            date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            city: order.shippingAddress ? order.shippingAddress.city : 'Unknown'
        }));

        console.log(`Orders Data: ${formattedOrders.length} orders formatted`);
        res.json({ success: true, orders: formattedOrders });
    } catch (err) {
        console.error('Orders Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/:id/return-action
// @desc    Process return action (refund, later, comment)
// @access  Private/Admin
router.put('/orders/:id/return-action', auth, adminAuth, async (req, res) => {
    try {
        const { action, comment } = req.body;
        // Search by orderNumber as ID might be orderNumber
        let order = await Order.findOne({ orderNumber: req.params.id });
        if (!order) {
            try { order = await Order.findById(req.params.id).populate('user'); } catch (e) {}
        } else {
            // Populate user if found by orderNumber
            await order.populate('user');
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (comment) {
            order.refundDetails.adminComment = comment;
        }

        if (action === 'refund') {
            order.orderStatus = 'returned';
            order.refundDetails.refundStatus = 'processed';
        }

        await order.save();

        // Send email notification for comment or refund
        try {
            const { sendReturnProcessed, sendReturnCommentOnly } = require('../utils/emailService');
            const email = order.user?.email || order.shippingAddress?.email;
            if (email) {
                if (action === 'refund') {
                    await sendReturnProcessed(email, order.orderNumber, order.refundDetails.refundAmount, comment);
                } else {
                    await sendReturnCommentOnly(email, order.orderNumber, comment);
                }
            }
        } catch (emailErr) {
            console.error('Failed to send return action email:', emailErr);
        }

        res.json({ success: true, message: action === 'refund' ? 'Refund processed successfully' : 'Comment added and notification sent', order });
    } catch (err) {
        console.error('Return Action Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/:id/refund
// @desc    Update refund status (initiated, processing, processed)
// @access  Private/Admin
router.put('/orders/:id/refund', auth, adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.orderStatus !== 'cancelled') {
            return res.status(400).json({ success: false, message: 'Only cancelled orders can be updated for refund' });
        }

        if (status) {
            order.refundDetails.refundStatus = status;
        } else {
            // Default behavior if no status provided
            order.refundDetails.refundStatus = 'processed';
        }
        
        await order.save();

        // If refund is processed, send email to user
        if (order.refundDetails.refundStatus === 'processed') {
            try {
                const { sendRefundProcessed } = require('../utils/emailService');
                const user = await User.findById(order.user);
                if (user) {
                    await sendRefundProcessed(user.email, order.orderNumber, order.refundDetails.refundAmount);
                    console.log('Refund processed email sent to user');
                }
            } catch (emailErr) {
                console.error('Failed to send refund email:', emailErr);
            }
        }

        res.json({ success: true, message: `Refund status updated to ${order.refundDetails.refundStatus}`, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', auth, adminAuth, async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        // Search by orderNumber as the frontend uses orderNumber as 'id' in the list
        let order = await Order.findOne({ orderNumber: req.params.id });

        if (!order) {
            // Fallback to findById
            try {
                order = await Order.findById(req.params.id);
            } catch (oidErr) {
                // Not a valid ObjectId
            }
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (status) order.orderStatus = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (status === 'delivered' || status === 'processed') order.deliveredAt = new Date();

        await order.save();
        res.json({ success: true, message: `Order status updated to ${status || order.orderStatus}`, order });
    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
