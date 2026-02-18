const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/content/:pageName
// @desc    Get content for a specific page
// @access  Public
router.get('/:pageName', async (req, res) => {
    try {
        let content = await PageContent.findOne({ pageName: req.params.pageName });
        if (!content) {
            // Return empty structure instead of 404 to avoid console errors
            return res.json({
                pageName: req.params.pageName,
                hero: { title: '', subtitle: '', image: '' },
                carousel: [],
                sections: [],
                values: [],
                brandPhilosophy: {
                    subtitle: 'The Art of Attire',
                    title: 'Elegance in Every Detail',
                    description: 'At ATTIRE, we believe that fashion is a silent language...',
                    image: '',
                    stats: [
                        { number: '100%', label: 'Premium Material' },
                        { number: '24h', label: 'Express Checkout' },
                        { number: '5k+', label: 'Happy Clients' }
                    ]
                },
                newsletter: {
                    title: 'Join The Club',
                    description: 'Receive exclusive early access to new collections and luxury fashion insights.'
                },
                cta: { title: '', description: '' },
                categories: [
                    { label: 'Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', link: '/products?category=Shirts' },
                    { label: 'Pants', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', link: '/products?category=Pants' },
                    { label: 'Track', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80', link: '/products?category=Track' },
                    { label: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', link: '/products?category=T-Shirts' },
                    { label: 'Belts', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', link: '/products?category=Belts' },
                    { label: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', link: '/products?category=Jeans' },
                    { label: 'Kurta', image: 'https://images.unsplash.com/photo-1610414316335-97836802f067?w=600&q=80', link: '/products?category=Kurta' },
                    { label: 'Shorts', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', link: '/products?category=Shorts' },
                    { label: 'Half Trousers', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', link: '/products?category=Half%20Trousers' },
                    { label: 'Sleeveless', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80', link: '/products?category=Sleeveless' }
                ]
            });
        }
        res.json(content);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/content
// @desc    Create or update page content
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
    const { pageName } = req.body;
    const updateFields = {};
    const possibleFields = ['hero', 'sections', 'values', 'cta', 'carousel', 'brandPhilosophy', 'newsletter', 'categories'];

    possibleFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateFields[field] = req.body[field];
        }
    });

    try {
        let content = await PageContent.findOne({ pageName });

        if (content) {
            // Update
            updateFields.lastUpdated = Date.now();
            content = await PageContent.findOneAndUpdate(
                { pageName },
                { $set: updateFields },
                { new: true }
            );
            return res.json(content);
        }

        // Create
        const newContent = new PageContent({
            pageName,
            ...updateFields
        });

        await newContent.save();
        res.json(newContent);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
