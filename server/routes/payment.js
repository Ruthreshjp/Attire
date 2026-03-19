const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        const status = err.response ? err.response.status : 500;
        const message = err.response ? err.response.data : (err.message || 'Razorpay Error');
        res.status(status).json({ success: false, message });
    }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment and create order
// @access  Private
router.post('/verify', auth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData
        } = req.body;

        console.log('Verifying Payment...');
        console.log('Order ID:', razorpay_order_id);
        console.log('Payment ID:', razorpay_payment_id);
        console.log('Signature:', razorpay_signature);

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        console.log('Expected Sign:', expectedSign);

        if (razorpay_signature === expectedSign) {
            console.log('Signature Verified!');
            // Payment verified, create the order in database
            try {
                const order = new Order({
                    user: req.user.id,
                    items: orderData.items.map(item => ({
                        product: item.id || item._id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color
                    })),
                    shippingAddress: orderData.shippingAddress,
                    paymentMethod: 'razorpay',
                    paymentStatus: 'paid',
                    subtotal: orderData.subtotal,
                    tax: orderData.tax || 0,
                    shippingCost: orderData.shippingCost || 0,
                    total: orderData.total,
                    orderStatus: 'processing',
                    paymentDetails: {
                        paymentId: razorpay_payment_id,
                        orderId: razorpay_order_id,
                        signature: razorpay_signature
                    },
                    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                console.log('Saving Order to DB...');
                const createdOrder = await order.save();
                console.log('Order Saved!', createdOrder._id);

                const user = await User.findById(req.user.id);

                // Send Confirmation Emails in background
                (async () => {
                    try {
                        const { generateInvoice } = require('../utils/pdfGenerator');
                        const { sendOrderConfirmation, sendAdminNewOrder } = require('../utils/emailService');
                        
                        const pdfBuffer = await generateInvoice(createdOrder);
                        
                        // Send to user
                        if (user && user.email) {
                            sendOrderConfirmation(user.email, createdOrder, pdfBuffer).catch(e => console.error('BG Payment confirm fail:', e));
                        }
                        
                        // Send to admin
                        sendAdminNewOrder(createdOrder, pdfBuffer).catch(e => console.error('BG Admin payment notify fail:', e));
                    } catch (innerErr) {
                        console.error('BG Payment Processing Error:', innerErr);
                    }
                })();

                // Update Product Stock and Sold count
                (async () => {
                    try {
                        const Product = require('../models/Product');
                        for (const item of orderData.items) {
                            await Product.findByIdAndUpdate(item.id || item._id, {
                                $inc: { 
                                    stock: -item.quantity,
                                    sold: item.quantity
                                }
                            });
                        }
                        console.log('Stock and Sold counts updated');
                    } catch (stockErr) {
                        console.error('Error updating stock/sold:', stockErr);
                    }
                })();

                // Clear user's cart
                if (user) {
                    user.cart = [];
                    await user.save();
                    console.log('Cart Cleared!');
                }

                return res.json({ success: true, message: "Payment Verified Successfully", order: createdOrder });
            } catch (saveError) {
                console.error('Order Save Error:', saveError);
                return res.status(500).json({ success: false, message: "Error saving order", error: saveError.message });
            }
        } else {
            console.warn('Signature Mismatch!');
            return res.status(400).json({ success: false, message: "Invalid Payment Signature" });
        }
    } catch (err) {
        console.error('Payment Verification Error:', err);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
});

module.exports = router;
