const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: Number,
        default: 0 // 0 for customer, 1 for admin
    },
    avatar: {
        type: String,
        default: ''
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    phone: {
        type: String,
        default: ''
    },
    recentlyViewed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        size: String,
        color: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
