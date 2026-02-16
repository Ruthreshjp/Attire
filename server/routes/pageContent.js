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
        const content = await PageContent.findOne({ pageName: req.params.pageName });
        if (!content) {
            return res.status(404).json({ msg: 'Content not found' });
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
    const { pageName, hero, sections, values, cta, carousel } = req.body;

    try {
        let content = await PageContent.findOne({ pageName });

        if (content) {
            // Update
            content = await PageContent.findOneAndUpdate(
                { pageName },
                { $set: { hero, sections, values, cta, carousel, lastUpdated: Date.now() } },
                { new: true }
            );
            return res.json(content);
        }

        // Create
        content = new PageContent({
            pageName,
            hero,
            sections,
            values,
            cta,
            carousel
        });

        await content.save();
        res.json(content);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
