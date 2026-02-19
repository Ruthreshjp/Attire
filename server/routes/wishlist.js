const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.wishlist.includes(req.params.productId)) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }

        user.wishlist.push(req.params.productId);
        await user.save();

        const updatedUser = await User.findById(req.user.id).populate('wishlist');
        res.json({ success: true, wishlist: updatedUser.wishlist });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();

        const updatedUser = await User.findById(req.user.id).populate('wishlist');
        res.json({ success: true, wishlist: updatedUser.wishlist });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
