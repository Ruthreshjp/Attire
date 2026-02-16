const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
    pageName: {
        type: String,
        required: true,
        unique: true
    },
    hero: {
        title: String,
        subtitle: String,
        image: String
    },
    sections: [{
        title: String,
        content: String,
        image: String
    }],
    values: [{
        icon: String,
        title: String,
        description: String
    }],
    cta: {
        title: String,
        description: String
    },
    carousel: [{
        image: String,
        title: String,
        subtitle: String,
        buttonText: String,
        link: String,
        isActive: Boolean
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PageContent', PageContentSchema);
