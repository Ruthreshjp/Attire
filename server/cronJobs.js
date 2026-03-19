const cron = require('node-cron');
const User = require('./models/User');
const { sendAbandonedCartReminder } = require('./utils/emailService');

// Run every day at 10 AM
const initAbandonedCartCron = () => {
    cron.schedule('0 10 * * *', async () => {
        console.log('Running Abandoned Cart Cron Job...');
        try {
            // Find users with items in cart who haven't placed an order in the last 24 hours
            // For simplicity, we just look for users with non-empty carts
            const usersWithCart = await User.find({ 'cart.0': { $exists: true } });
            
            for (const user of usersWithCart) {
                // Here you could add more logic, e.g. check if they logged in recently but didn't buy
                await sendAbandonedCartReminder(user.email, user.name);
                console.log(`Abandoned cart reminder sent to: ${user.email}`);
            }
        } catch (error) {
            console.error('Abandoned Cart Cron Error:', error);
        }
    });
};

module.exports = initAbandonedCartCron;
