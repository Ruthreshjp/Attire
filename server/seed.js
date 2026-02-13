const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Carousel = require('./models/Carousel');

dotenv.config();

const products = [
    {
        name: 'Luxury Chronograph Watch',
        description: 'Elite craftsmanship with stainless steel strap and sapphire crystal glass.',
        category: 'Watches',
        price: 12999,
        originalPrice: 18999,
        discount: 31,
        images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', alt: 'Luxury Watch' }],
        rating: 4.8,
        colors: [
            { name: 'Black', hexCode: '#000000' },
            { name: 'Silver', hexCode: '#C0C0C0' }
        ],
        sizes: ['M'],
        stock: 15,
        tags: ['premium', 'watch', 'new'],
        isNewArrival: true,
        isFeatured: true
    },
    {
        name: 'Classic Aviator Sunglasses',
        description: 'Iconic aviator style with polarized lenses and UV400 protection.',
        category: 'Eyewear',
        price: 5599,
        images: [{ url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', alt: 'Sunglasses' }],
        rating: 4.5,
        colors: [
            { name: 'Black', hexCode: '#000000' }
        ],
        sizes: ['M'],
        stock: 32,
        tags: ['summer', 'eyewear'],
        isNewArrival: false,
        isFeatured: false
    }
];

const carousels = [
    {
        type: 'hero',
        image: {
            url: 'https://images.unsplash.com/photo-1507679799987-c7377ec48696?w=1600&q=80',
            alt: 'Hero 1'
        },
        title: 'Elevate Your Style',
        subtitle: 'Discover our exclusive collection of premium accessories',
        link: '/products',
        buttonText: 'Shop Now',
        order: 1,
        isActive: true
    },
    {
        type: 'hero',
        image: {
            url: 'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=1600&q=80',
            alt: 'Hero 2'
        },
        title: 'The Modern Gentleman',
        subtitle: 'Crafted for those who appreciate the finer things',
        link: '/products',
        buttonText: 'Explore Collection',
        order: 2,
        isActive: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attire');
        console.log('✅ Connected to MongoDB for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Carousel.deleteMany({});
        console.log('🗑️  Existing data cleared');

        // Create Admin
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const admin = new User({
            name: 'Admin User',
            email: 'admin@attire.com',
            password: adminPassword,
            role: 1
        });
        await admin.save();
        console.log('👤 Admin user created: admin@attire.com / admin123');

        // Create Regular User
        const userPassword = await bcrypt.hash('user123', salt);
        const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: userPassword,
            role: 0
        });
        await user.save();
        console.log('👤 Regular user created: john@example.com / user123');

        // Insert Products
        await Product.insertMany(products);
        console.log(`📦 ${products.length} Products inserted`);

        // Insert Carousel
        await Carousel.insertMany(carousels);
        console.log(`🖼️  ${carousels.length} Carousel items inserted`);

        console.log('✨ Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
