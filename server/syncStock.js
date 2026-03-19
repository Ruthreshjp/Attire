const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

const syncStock = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attire');
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Processing ${products.length} products...`);

        for (const p of products) {
            // Find all non-cancelled orders for this product
            const orders = await Order.find({
                'items.product': p._id,
                orderStatus: { $ne: 'cancelled' }
            });

            let totalSold = 0;
            orders.forEach(o => {
                o.items.forEach(item => {
                    if (item.product.toString() === p._id.toString()) {
                        totalSold += item.quantity;
                    }
                });
            });

            console.log(`Product: ${p.name} | Calculated Sold: ${totalSold} vs DB Sold: ${p.sold}`);
            
            // If they are different, we might want to adjust stock.
            // But we don't know the "original" stock.
            // However, we can at least sync the 'sold' count.
            p.sold = totalSold;
            await p.save();
        }

        console.log('Stock/Sold sync completed successfully.');
        process.exit();
    } catch (err) {
        console.error('Sync Error:', err);
        process.exit(1);
    }
};

syncStock();
