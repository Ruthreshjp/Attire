const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attire', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/content', require('./routes/pageContent'));

// Image Proxy Route to bypass CORS
const axios = require('axios');
app.get('/api/proxy-image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }
        const response = await axios.get(imageUrl, { 
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            }
        });
        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'Failed to fetch image', details: err.message });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Attire E-commerce API is running' });
});

// Email Diagnosis Route
app.get('/api/test-email', async (req, res) => {
    try {
        const { sendVerificationCode } = require('./utils/emailService');
        await sendVerificationCode('travelzonnee@gmail.com', '999999');
        res.json({ success: true, message: 'Diagnosed successfully: Port 587 is open and Email was sent!' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, code: e.code, stack: e.stack });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Image size is too large. Please use a smaller image (under 100MB).'
        });
    }
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize Cron Jobs
const initAbandonedCartCron = require('./cronJobs');
initAbandonedCartCron();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
