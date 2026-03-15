const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
    pageName: {
        type: String,
        required: true,
        unique: true
    },
    // Common/Generic sections
    hero: {
        title: String,
        subtitle: String,
        image: String,
        buttonText: String,
        link: String
    },
    sections: [{
        title: String,
        content: String,
        image: String,
        eyebrow: String,
        link: String,
        linkText: String
    }],
    values: [{
        icon: String,
        title: String,
        description: String
    }],
    cta: {
        title: String,
        description: String,
        buttonText: String,
        link: String
    },
    carousel: [{
        image: String,
        title: String,
        subtitle: String,
        buttonText: String,
        link: String,
        isActive: Boolean,
        titleColor: String,   // black, gold, or white
        subtitleColor: String // black, gold, or white
    }],
    // Specific sections for Home
    ticker: [String],
    brandPhilosophy: {
        subtitle: String,
        title: String,
        description: String,
        image: String,
        stats: [{
            number: String,
            label: String
        }]
    },
    newsletter: {
        eyebrow: String,
        title: String,
        description: String
    },
    categories: [{
        label: String,
        image: String,
        link: String
    }],
    footer: {
        brandName: String,
        brandDesc: String,
        socialLinks: [{
            platform: String,
            url: String
        }],
        copyright: String,
        bottomText: String
    },
    // New Home Specific Sections
    signature: mongoose.Schema.Types.Mixed,
    lifestyle: mongoose.Schema.Types.Mixed,
    newArrivals: mongoose.Schema.Types.Mixed,
    trending: mongoose.Schema.Types.Mixed,
    editorial1: mongoose.Schema.Types.Mixed,
    craft: mongoose.Schema.Types.Mixed,
    flagship: mongoose.Schema.Types.Mixed,
    editorial2: mongoose.Schema.Types.Mixed,
    statsBand: mongoose.Schema.Types.Mixed,
    promise: mongoose.Schema.Types.Mixed,
    // Catch-all for extra flexible data
    metadata: mongoose.Schema.Types.Mixed,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PageContent', PageContentSchema);
