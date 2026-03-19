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
        console.log('Manual Order Saved!', createdOrder._id);

        // Update Product Stock and Sold count
        (async () => {
            try {
                const Product = require('../models/Product');
                for (const item of orderItems) {
                    await Product.findByIdAndUpdate(item.id || item._id, {
                        $inc: { 
                            stock: -item.quantity,
                            sold: item.quantity
                        }
                    });
                }
                console.log('Stock and Sold counts updated (Manual Order)');
            } catch (stockErr) {
                console.error('Error updating stock/sold (Manual Order):', stockErr);
            }
        })();

        // Clear user's cart after successful order
        const user = await User.findById(req.user.id);
        if (user) {
            user.cart = [];
            await user.save();
        }

        // Send Confirmation Emails in background
        (async () => {
            try {
                const { generateInvoice } = require('../utils/pdfGenerator');
                const { sendOrderConfirmation, sendAdminNewOrder } = require('../utils/emailService');
                
                const pdfBuffer = await generateInvoice(createdOrder);
                
                if (user && user.email) {
                    sendOrderConfirmation(user.email, createdOrder, pdfBuffer).catch(e => console.error('BG Order confirmation failed:', e));
                }
                sendAdminNewOrder(createdOrder, pdfBuffer).catch(e => console.error('BG Admin order email failed:', e));
            } catch (innerErr) {
                console.error('BG Order Processing Error:', innerErr);
            }
        })();

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
        const { accountName, accountNumber, ifscCode, reason } = req.body;
        
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check user ownership
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check if eligible for cancel (pending/shipped/processing AND NOT delivered/processed)
        if (order.orderStatus === 'delivered' || order.orderStatus === 'processed') {
            return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled. Use return option instead.' });
        }

        // Check if cancellable (within 2 days of creation)
        const orderDate = new Date(order.createdAt);
        const currentDate = new Date();
        const diffDays = Math.ceil(Math.abs(currentDate - orderDate) / (1000 * 60 * 60 * 24)); 
        
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
            cancelReason: reason || '',
            refundStatus: 'pending',
            refundAmount: order.total > 50 ? order.total - 50 : 0
        };

        await order.save();

        // Send Cancellation Emails in background
        (async () => {
            try {
                const { sendCancelRequestUser, sendCancelRequestAdmin } = require('../utils/emailService');
                const user = await User.findById(req.user.id);
                
                sendCancelRequestUser(user.email, order.orderNumber).catch(e => console.error('BG Cancel user email failed:', e));
                sendCancelRequestAdmin(order.orderNumber).catch(e => console.error('BG Cancel admin email failed:', e));
            } catch (innerErr) {
                console.error('BG Cancel Processing Error:', innerErr);
            }
        })();

        res.json({ success: true, message: 'Order cancelled successfully. Refund initiated processing. Please wait for confirmation from admin.', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/orders/:id/return
// @desc    Initiate product return
// @access  Private
router.put('/:id/return', auth, async (req, res) => {
    try {
        const { accountName, accountNumber, ifscCode, reason } = req.body;
        
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check user ownership
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check if eligible for return (delivered/processed)
        if (order.orderStatus !== 'delivered' && order.orderStatus !== 'processed') {
            return res.status(400).json({ success: false, message: 'Only delivered products can be returned.' });
        }

        order.orderStatus = 'return_pending';
        
        // Setup refund details
        order.refundDetails = {
            accountName,
            accountNumber,
            ifscCode,
            returnReason: reason || '',
            refundStatus: 'pending',
            refundAmount: order.total // Full refund for returns usually, or as per policy
        };

        await order.save();

        // Send Return Emails in background
        (async () => {
            try {
                const { sendReturnRequestUser, sendReturnRequestAdmin } = require('../utils/emailService');
                const user = await User.findById(req.user.id);
                
                sendReturnRequestUser(user.email, order.orderNumber).catch(e => console.error('BG Return user email failed:', e));
                sendReturnRequestAdmin(order.orderNumber).catch(e => console.error('BG Return admin email failed:', e));
            } catch (innerErr) {
                console.error('BG Return Processing Error:', innerErr);
            }
        })();

        res.json({ success: true, message: 'Return initiated successfully. Your amount will be refunded after we receive the product and completion of quality checks.', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
