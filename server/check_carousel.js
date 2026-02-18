const mongoose = require('mongoose');
const PageContent = require('./models/PageContent');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attire');
        const content = await PageContent.findOne({ pageName: 'home' });
        console.log('Carousel slides count:', content && content.carousel ? content.carousel.length : 0);
        if (content && content.carousel) {
            content.carousel.forEach((s, i) => console.log(`Slide ${i + 1}: ${s.title} (Active: ${s.isActive})`));
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
