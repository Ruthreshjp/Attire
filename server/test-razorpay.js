require('dotenv').config();
const Razorpay = require('razorpay');

async function test() {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: 1000 * 100, // 1000 INR
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        console.log('Order created successfully:', order);
    } catch (err) {
        console.error('Razorpay Error:', err);
    }
}

test();
