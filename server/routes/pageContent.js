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
                cta: { title: '', description: '' }
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
    const possibleFields = ['hero', 'sections', 'values', 'cta', 'carousel'];

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
