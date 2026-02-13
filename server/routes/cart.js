const express = require('express');
const router = express.Router();

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', async (req, res) => {
    res.json({ message: 'Get cart - To be implemented' });
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', async (req, res) => {
    res.json({ message: 'Add to cart - To be implemented' });
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', async (req, res) => {
    res.json({ message: 'Remove from cart - To be implemented' });
});

module.exports = router;
