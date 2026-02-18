const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    isSpecialOffer: {
        type: Boolean,
        default: false
    },
    couponCode: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        default: null
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    images: [{
        url: String,
        alt: String
    }],
    colors: [{
        name: String,
        hexCode: String,
        images: [{
            url: String,
            alt: String
        }]
    }],
    sizes: [{
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '8', '9', '10', '11', '12', 'One Size', 'Adjustable']
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isNewArrival: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [String]
}, {
    timestamps: true
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating = (sum / this.reviews.length).toFixed(1);
    }
    return this.rating;
};

module.exports = mongoose.model('Product', productSchema);
