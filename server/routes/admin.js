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
        const products = await Product.find().select('category title');
        const users = await User.find({ role: 0 }).select('name email createdAt lastLogin');
        
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'category title');

        res.json({
            success: true,
            products,
            users,
            orders
        });
    } catch (err) {
        console.error(err);
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
            user: order.user ? order.user.name : order.shippingAddress.name,
            amount: order.total,
            status: order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid', 
            orderStatus: order.orderStatus,
            date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            city: order.shippingAddress ? order.shippingAddress.city : 'Unknown'
        }));

        res.json({ success: true, orders: formattedOrders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
