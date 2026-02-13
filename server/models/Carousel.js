const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['hero', 'offer'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: String,
    image: {
        url: {
            type: String,
            required: true
        },
        alt: String
    },
    buttonText: String,
    link: String,
    discount: String, // For offer carousel
    code: String, // Promo code for offer carousel
    category: String, // For offer carousel
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Carousel', carouselSchema);
