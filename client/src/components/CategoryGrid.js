import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_CATEGORIES = [
    { label: 'Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', link: '/products?category=Shirts' },
    { label: 'Pants', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', link: '/products?category=Pants' },
    { label: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', link: '/products?category=T-Shirts' },
    { label: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', link: '/products?category=Jeans' },
    { label: 'Kurta', image: 'https://images.unsplash.com/photo-1610414316335-97836802f067?w=600&q=80', link: '/products?category=Kurta' },
    { label: 'Track', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80', link: '/products?category=Track' },
    { label: 'Shorts', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', link: '/products?category=Shorts' },
    { label: 'Belts', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', link: '/products?category=Belts' },
    { label: 'Sleeveless', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80', link: '/products?category=Sleeveless' },
    { label: 'Half Trousers', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', link: '/products?category=Half%20Trousers' },
];

const CategoryGrid = ({ categories }) => {
    const navigate = useNavigate();
    const displayCategories = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

    return (
        <section className="category-grid-section">
            <div className="section-header">
                <p className="section-subtitle">Browse by Category</p>
                <h2 className="section-title">Our Collections</h2>
            </div>
            <div className="category-grid">
                {displayCategories.map((cat, index) => (
                    <div
                        key={index}
                        className="category-card"
                        onClick={() => navigate(cat.link)}
                    >
                        <div className="category-image-wrapper" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                            <img src={cat.image} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="category-info">
                            <h3>{cat.label}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoryGrid;
