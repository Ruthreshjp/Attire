import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';


const Products = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSize, setSelectedSize] = useState('');

    // Sample products data - will be fetched from API
    const allProducts = [
        {
            id: 1,
            name: 'Luxury Chronograph Watch',
            category: 'Watches',
            price: 12999,
            originalPrice: 18999,
            discount: 31,
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
            rating: 4.8,
            reviews: 156,
            colors: ['#000000', '#C0C0C0', '#B8860B'],
            sizes: ['Adjustable'],
            stock: 15,
            sold: 450,
            isNew: true
        },
        {
            id: 2,
            name: 'Classic Aviator Sunglasses',
            category: 'Eyewear',
            price: 5599,
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
            rating: 4.5,
            reviews: 89,
            colors: ['#000000', '#8B4513'],
            sizes: ['One Size'],
            stock: 32,
            sold: 210,
            isNew: false
        },
        {
            id: 3,
            name: 'Genuine Leather Briefcase',
            category: 'Bags',
            price: 15999,
            originalPrice: 23999,
            discount: 33,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
            rating: 4.9,
            reviews: 67,
            colors: ['#000000', '#8B4513'],
            sizes: ['Standard'],
            stock: 10,
            sold: 124,
            isNew: false
        },
        {
            id: 4,
            name: 'Minimalist Bifold Wallet',
            category: 'Wallets',
            price: 2399,
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
            rating: 4.6,
            reviews: 245,
            colors: ['#000000', '#8B4513', '#2F4F4F'],
            sizes: ['One Size'],
            stock: 85,
            sold: 980,
            isNew: true
        },
        {
            id: 5,
            name: 'Premium Silk Tie Set',
            category: 'Ties',
            price: 1999,
            image: 'https://images.unsplash.com/photo-1589756823851-ede1be674188?w=600&q=80',
            rating: 4.7,
            reviews: 112,
            colors: ['#8B0000', '#000080', '#000000'],
            sizes: ['Standard'],
            stock: 45,
            sold: 340,
            isNew: false
        },
        {
            id: 6,
            name: 'Silver Cufflink Set',
            category: 'Cufflinks',
            price: 3199,
            originalPrice: 4799,
            discount: 33,
            image: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?w=600&q=80',
            rating: 4.8,
            reviews: 78,
            colors: ['#C0C0C0', '#FFD700'],
            sizes: ['One Size'],
            stock: 25,
            sold: 156,
            isNew: true
        },
        {
            id: 7,
            name: 'Top Grain Leather Belt',
            category: 'Belts',
            price: 3999,
            image: 'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=600&q=80',
            rating: 4.6,
            reviews: 189,
            colors: ['#000000', '#8B4513', '#62422C'],
            sizes: ['32', '34', '36', '38'],
            stock: 50,
            sold: 670,
            isNew: false
        },
        {
            id: 8,
            name: 'Automatic Mechanical Watch',
            category: 'Watches',
            price: 24999,
            originalPrice: 34999,
            discount: 28,
            image: 'https://images.unsplash.com/photo-1508685096489-7abac47d3ad7?w=600&q=80',
            rating: 5.0,
            reviews: 43,
            colors: ['#C0C0C0', '#FFD700'],
            sizes: ['Adjustable'],
            stock: 5,
            sold: 89,
            isNew: true
        }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products);
                    setFilteredProducts(data.products);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        // Handle search from URL params
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            handleSearch(searchQuery);
        }
    }, [searchParams]);

    const handleSearch = (query) => {
        if (!query) {
            setFilteredProducts(products);
            return;
        }

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    const handleFilter = (filterType, value) => {
        let filtered = [...products];

        if (filterType === 'sort') {
            if (value === 'price-low') {
                filtered.sort((a, b) => a.price - b.price);
                setSortBy('Price: Low to High');
            } else if (value === 'price-high') {
                filtered.sort((a, b) => b.price - a.price);
                setSortBy('Price: High to Low');
            }
        } else if (filterType === 'category') {
            if (value && value !== 'all') {
                filtered = products.filter(p => p.category.toLowerCase() === value.toLowerCase());
            }
            setSelectedCategory(value);
        } else if (filterType === 'size') {
            filtered = products.filter(p => p.sizes.includes(value));
            setSelectedSize(value);
        } else if (filterType === 'clear') {
            filtered = products;
            setSortBy('');
            setSelectedCategory('');
            setSelectedSize('');
        }

        setFilteredProducts(filtered);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <img src="/attire-logo.svg" alt="Loading" className="loading-logo" />
                <div className="spinner"></div>
                <p>Loading Products...</p>
            </div>
        );
    }

    return (
        <div className="products-page">
            <Navbar onSearch={handleSearch} onFilter={handleFilter} />

            <div className="products-container">
                <div className="products-header">
                    <h1>Men's Collection</h1>
                    <p className="products-count">{filteredProducts.length} Products</p>
                </div>

                {/* Active Filters */}
                {(sortBy || selectedCategory || selectedSize) && (
                    <div className="active-filters">
                        <span className="filter-label">Active Filters:</span>
                        {sortBy && <span className="filter-tag">{sortBy}</span>}
                        {selectedCategory && <span className="filter-tag">{selectedCategory}</span>}
                        {selectedSize && <span className="filter-tag">Size: {selectedSize}</span>}
                        <button
                            className="clear-all-btn"
                            onClick={() => handleFilter('clear', null)}
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="no-products">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <h3>No Products Found</h3>
                        <p>Try adjusting your filters or search query</p>
                        <button onClick={() => handleFilter('clear', null)}>Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
