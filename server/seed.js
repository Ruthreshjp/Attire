const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Carousel = require('./models/Carousel');
const PageContent = require('./models/PageContent');

dotenv.config();

const products = [
    {
        name: 'Premium Wool Blazer',
        description: 'Sophisticated slim-fit blazer crafted from 100% Italian wool.',
        category: 'jackets',
        price: 8999,
        originalPrice: 12999,
        discount: 30,
        images: [{ url: 'https://images.unsplash.com/photo-1594932224031-9ffb0d96ee7c?w=800&q=80', alt: 'Premium Blazer' }],
        rating: 4.9,
        colors: [
            { name: 'Navy Blue', hexCode: '#000080', images: [{ url: 'https://images.unsplash.com/photo-1594932224031-9ffb0d96ee7c?w=800&q=80', alt: 'Navy Blazer' }] }
        ],
        sizes: ['M', 'L', 'XL'],
        stock: 20,
        tags: ['formal', 'menswear', 'premium'],
        isNewArrival: true,
        isFeatured: true,
        isSpecialOffer: true,
        couponCode: 'BLAZER30',
        sold: 245
    },
    {
        name: 'Urban Cargo Joggers',
        description: 'Utility-inspired cargo joggers with water-resistant finish and multiple pockets.',
        category: 'joggers',
        price: 2799,
        originalPrice: 3999,
        discount: 30,
        images: [{ url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80', alt: 'Cargo Joggers' }],
        rating: 4.8,
        colors: [{ name: 'Olive', hexCode: '#556B2F' }],
        sizes: ['30', '32', '34'],
        stock: 15,
        tags: ['streetwear', 'utility'],
        isNewArrival: true,
        isFeatured: true,
        sold: 189
    },
    {
        name: 'Linen Summer Shirt',
        description: 'Breathable linen blend shirt, perfect for warm weather.',
        category: 'shirts',
        price: 1899,
        originalPrice: 2499,
        discount: 24,
        images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', alt: 'Linen Shirt' }],
        rating: 4.6,
        colors: [{ name: 'White', hexCode: '#FFFFFF' }],
        sizes: ['S', 'M', 'L'],
        stock: 40,
        isNewArrival: true,
        isSpecialOffer: true,
        couponCode: 'SUMMER25',
        sold: 312
    },
    {
        name: 'Technical Windbreaker',
        description: 'Lightweight, wind-proof technical jacket with high-neck collar.',
        category: 'jackets',
        price: 4599,
        originalPrice: 5999,
        discount: 23,
        images: [{ url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80', alt: 'Windbreaker' }],
        rating: 4.7,
        colors: [{ name: 'Black', hexCode: '#000000' }],
        sizes: ['M', 'L', 'XL'],
        stock: 25,
        isNewArrival: false,
        isFeatured: true
    },
    {
        name: 'Heavyweight Graphic Tee',
        description: 'Vintage-washed graphic T-shirt with signature ATTIRE branding.',
        category: 't-shirts',
        price: 1299,
        originalPrice: 1999,
        discount: 35,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', alt: 'Graphic Tee' }],
        rating: 4.5,
        colors: [{ name: 'Slate Gray', hexCode: '#708090' }],
        sizes: ['M', 'L', 'XL'],
        stock: 50,
        isNewArrival: true
    },
    {
        name: 'Italian Leather Chelsea Boots',
        description: 'Handcrafted leather boots with elasticated sides and pull tabs.',
        category: 'footwear',
        price: 7499,
        originalPrice: 9999,
        discount: 25,
        images: [{ url: 'https://images.unsplash.com/photo-1520639889410-1df4151ee1f1?w=800&q=80', alt: 'Chelsea Boots' }],
        rating: 4.9,
        colors: [{ name: 'Tan', hexCode: '#D2B48C' }],
        sizes: ['8', '9', '10', '11'],
        stock: 12,
        isNewArrival: true,
        isSpecialOffer: true,
        couponCode: 'STEPUP',
        sold: 156
    },
    {
        name: 'Heritage Silk Tie',
        description: 'Hand-stitched silk tie with classic jacquard pattern.',
        category: 'accessories',
        price: 1499,
        originalPrice: 2199,
        discount: 32,
        images: [{ url: 'https://images.unsplash.com/photo-1589756823851-ede1be37b08e?w=800&q=80', alt: 'Silk Tie' }],
        rating: 4.8,
        colors: [{ name: 'Crimson', hexCode: '#990000' }],
        sizes: ['One Size'],
        stock: 100,
        isNewArrival: false,
        isSpecialOffer: true,
        couponCode: 'ACCESSORY15',
        sold: 420
    },
    {
        name: 'Monochromatic Knit Sweater',
        description: 'Cozy cashmere blend sweater for minimalist layering.',
        category: 'sweaters',
        price: 3499,
        originalPrice: 4999,
        discount: 30,
        images: [{ url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', alt: 'Knit Sweater' }],
        rating: 4.7,
        colors: [{ name: 'Heather Gray', hexCode: '#A9A9A9' }],
        sizes: ['M', 'L', 'XL'],
        stock: 30,
        isNewArrival: true,
        isFeatured: true
    },
    {
        name: 'Sculpted Aviator Sunglasses',
        description: 'Titanium frame aviators with polarized lenses.',
        category: 'accessories',
        price: 5999,
        originalPrice: 7999,
        discount: 25,
        images: [{ url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', alt: 'Aviators' }],
        rating: 4.9,
        colors: [{ name: 'Gold', hexCode: '#FFD700' }],
        sizes: ['One Size'],
        stock: 18,
        isSpecialOffer: true,
        couponCode: 'VISION25'
    },
    {
        name: 'Heritage Canvas Backpack',
        description: 'Durable canvas backpack with leather accents and laptop compartment.',
        category: 'accessories',
        price: 3299,
        originalPrice: 4599,
        discount: 28,
        images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', alt: 'Backpack' }],
        rating: 4.6,
        colors: [{ name: 'Tan', hexCode: '#C2B280' }],
        sizes: ['One Size'],
        stock: 22,
        isNewArrival: true
    },
    {
        name: 'Tech Fleece Hoodie',
        description: 'Modern fit tech fleece hoodie with bonded zip pocket and articulated sleeves.',
        category: 'sweatshirts',
        price: 4999,
        originalPrice: 6999,
        discount: 28,
        images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', alt: 'Tech Hoodie' }],
        rating: 4.8,
        colors: [{ name: 'Carbon Gray', hexCode: '#333333' }],
        sizes: ['M', 'L', 'XL'],
        stock: 15,
        isNewArrival: true,
        isFeatured: true
    },
    {
        name: 'Denim Trucker Jacket',
        description: 'Classic heavy-wash denim jacket with copper hardware and reinforced stitching.',
        category: 'jackets',
        price: 3999,
        originalPrice: 5499,
        discount: 27,
        images: [{ url: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&q=80', alt: 'Denim Jacket' }],
        rating: 4.6,
        colors: [{ name: 'Indigo', hexCode: '#00416A' }],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 20,
        isNewArrival: false,
        isFeatured: false
    },
    {
        name: 'Modern Chino Trousers',
        description: 'Stretch cotton chinos in a tapered fit, perfect for smart-casual transitions.',
        category: 'trousers',
        price: 2499,
        originalPrice: 3499,
        discount: 28,
        images: [{ url: 'https://images.unsplash.com/photo-1624371414361-e6e9021bedaa?w=800&q=80', alt: 'Chino Trousers' }],
        rating: 4.7,
        colors: [{ name: 'Khaki', hexCode: '#C3B091' }],
        sizes: ['30', '32', '34', '36'],
        stock: 35,
        isNewArrival: true,
        isFeatured: true
    },
    {
        name: 'Oxford Button-Down Shirt',
        description: 'A timeless staple crafted from heavy-gauge Oxford cotton with a refined texture.',
        category: 'shirts',
        price: 1999,
        originalPrice: 2999,
        discount: 33,
        images: [{ url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', alt: 'Oxford Shirt' }],
        rating: 4.8,
        colors: [{ name: 'Sky Blue', hexCode: '#87CEEB' }],
        sizes: ['M', 'L', 'XL'],
        stock: 45,
        isNewArrival: false,
        isSpecialOffer: true,
        couponCode: 'OFFICE20'
    },
    {
        name: 'Classic Suede Loafers',
        description: 'Italian suede loafers with tassel detail and cushioned insole for all-day elegance.',
        category: 'footwear',
        price: 6499,
        originalPrice: 8999,
        discount: 27,
        images: [{ url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80', alt: 'Loafers' }],
        rating: 4.9,
        colors: [{ name: 'Espresso', hexCode: '#3D2B1F' }],
        sizes: ['8', '9', '10', '11'],
        stock: 12,
        isFeatured: true
    },
    {
        name: 'Minimalist Leather Wallet',
        description: 'Full-grain leather bifold wallet with RFID protection and slim profile.',
        category: 'accessories',
        price: 1299,
        originalPrice: 1999,
        discount: 35,
        images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', alt: 'Leather Wallet' }],
        rating: 4.8,
        colors: [{ name: 'Chestnut', hexCode: '#8B4513' }],
        sizes: ['One Size'],
        stock: 60,
        isSpecialOffer: true,
        couponCode: 'WALLET20'
    },
    {
        name: 'V-Neck Merino Sweater',
        description: 'Extra-fine merino wool sweater, lightweight yet warm for versatile layering.',
        category: 'sweaters',
        price: 2999,
        originalPrice: 4299,
        discount: 30,
        images: [{ url: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=800&q=80', alt: 'Merino Sweater' }],
        rating: 4.7,
        colors: [{ name: 'Forest Green', hexCode: '#228B22' }],
        sizes: ['M', 'L', 'XL'],
        stock: 25,
        isFeatured: true
    },
    {
        name: 'Vintage Aviator Sunglasses',
        description: 'Classic aviator frames with gold finish and green tinted G-15 lenses.',
        category: 'accessories',
        price: 4599,
        originalPrice: 6299,
        discount: 27,
        images: [{ url: 'https://images.unsplash.com/photo-1511499767390-90342f53fb4a?w=800&q=80', alt: 'Aviators' }],
        rating: 4.8,
        colors: [{ name: 'Gold', hexCode: '#FFD700' }],
        sizes: ['One Size'],
        stock: 15,
        isSpecialOffer: true,
        couponCode: 'RETRO25'
    },
    {
        name: 'Rugged Cargo Shorts',
        description: 'Canvas cargo shorts with heavy-duty pockets and reinforced seat for utility.',
        category: 'shorts',
        price: 1899,
        originalPrice: 2699,
        discount: 30,
        images: [{ url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', alt: 'Cargo Shorts' }],
        rating: 4.6,
        colors: [{ name: 'Olive Drab', hexCode: '#6B8E23' }],
        sizes: ['30', '32', '34', '36'],
        stock: 30,
        isNewArrival: false
    },
    {
        name: 'Premium Leather Belt',
        description: 'Full-grain Italian leather belt with a brushed nickel buckle, essential for every formal look.',
        category: 'accessories',
        price: 1499,
        originalPrice: 2199,
        discount: 32,
        images: [{ url: 'https://images.unsplash.com/photo-1624222247344-550fbadcd973?w=800&q=80', alt: 'Leather Belt' }],
        rating: 4.8,
        colors: [{ name: 'Deep Brown', hexCode: '#4B2511' }],
        sizes: ['One Size'],
        stock: 50,
        isFeatured: true
    }
];

const carousels = [
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1507679799987-c7377ec48696?w=1600&q=80', alt: 'Signature Suit Collection' },
        title: 'The Signature Collection',
        subtitle: 'Crafted for the modern visionary.',
        link: '/products?category=suits',
        buttonText: 'Shop Tailoring',
        order: 1,
        isActive: true
    },
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=1600&q=80', alt: 'Premium Weekend Wear' },
        title: 'Refined Leisure',
        subtitle: 'Luxury weekend comfort redefined.',
        link: '/products',
        buttonText: 'Explore Casuals',
        order: 2,
        isActive: true
    },
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80', alt: 'Seasonal Trends' },
        title: 'Seasonal Narrative',
        subtitle: 'Spring/Summer 2026 Archive.',
        link: '/products?isNewArrival=true',
        buttonText: 'View New Arrivals',
        order: 3,
        isActive: true
    },
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1539109132314-34a77ae68c44?w=1600&q=80', alt: 'Streetwear Fusion' },
        title: 'Urban Synthesis',
        subtitle: 'Where technical precision meets street culture.',
        link: '/products?category=joggers',
        buttonText: 'Shop Streetwear',
        order: 4,
        isActive: true
    },
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=1600&q=80', alt: 'Modern Office Essentials' },
        title: 'The Office Edit',
        subtitle: 'Sharp silhouettes for the modern workplace.',
        link: '/products?category=shirts',
        buttonText: 'Shop Office Wear',
        order: 5,
        isActive: true
    },
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1600&q=80', alt: 'Premium Outerwear' },
        title: 'Elevation Lab',
        subtitle: 'High-performance technical outerwear.',
        link: '/products?category=jackets',
        buttonText: 'Shop Outerwear',
        order: 6,
        isActive: true
    },
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1516257984877-283d847150a0?w=1600&q=80', alt: 'Luxury Knitwear' },
        title: 'Essential Layers',
        subtitle: 'Finely spun knitwear for every season.',
        link: '/products?category=sweaters',
        buttonText: 'Shop Knits',
        order: 7,
        isActive: true
    },
    {
        type: 'hero',
        image: { url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=80', alt: 'Monochrome Collection' },
        title: 'Minimalist Monochrome',
        subtitle: 'The ultimate expression of simplified elegance.',
        link: '/products',
        buttonText: 'Shop Collection',
        order: 8,
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
        await PageContent.deleteMany({});
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

        // Insert Home Page Content
        const homeContent = new PageContent({
            pageName: 'home',
            carousel: carousels.map(c => ({
                image: c.image.url,
                title: c.title,
                subtitle: c.subtitle,
                buttonText: c.buttonText,
                link: c.link,
                isActive: c.isActive
            })),
            brandPhilosophy: {
                subtitle: 'The Art of Attire',
                title: 'Elegance in Every Detail',
                description: 'At ATTIRE, we believe that fashion is a silent language that speaks before you do. Our curated collections are more than just clothing; they are statements of identity, meticulously crafted for the modern visionary who demands excellence without compromise.',
                image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80',
                stats: [
                    { number: '100%', label: 'Premium Material' },
                    { number: '24h', label: 'Express Checkout' },
                    { number: '5k+', label: 'Happy Clients' }
                ]
            },
            newsletter: {
                title: 'Join The Club',
                description: 'Receive exclusive early access to new collections and luxury fashion insights.'
            },
            categories: [
                { label: 'Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', link: '/products?category=Shirts' },
                { label: 'Pants', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', link: '/products?category=Pants' },
                { label: 'Track', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80', link: '/products?category=Track' },
                { label: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', link: '/products?category=T-Shirts' },
                { label: 'Belts', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', link: '/products?category=Belts' },
                { label: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', link: '/products?category=Jeans' },
                { label: 'Kurta', image: 'https://images.unsplash.com/photo-1610414316335-97836802f067?w=600&q=80', link: '/products?category=Kurta' },
                { label: 'Shorts', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', link: '/products?category=Shorts' },
                { label: 'Half Trousers', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', link: '/products?category=Half%20Trousers' },
                { label: 'Sleeveless', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80', link: '/products?category=Sleeveless' }
            ]
        });
        await homeContent.save();
        console.log('🏠 Home page content seeded');

        console.log('✨ Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
