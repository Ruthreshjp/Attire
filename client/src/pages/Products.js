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
            name: 'Premium Wool Blazer',
            category: 'jackets',
            price: 8999,
            originalPrice: 12999,
            discount: 30,
            image: 'https://images.unsplash.com/photo-1594932224031-9ffb0d96ee7c?w=600&q=80',
            rating: 4.9,
            reviews: 156,
            colors: ['#000080', '#36454F'],
            sizes: ['M', 'L', 'XL'],
            stock: 15,
            sold: 450,
            isNew: true
        },
        {
            id: 2,
            name: 'Slim Fit Oxford Shirt',
            category: 'shirts',
            price: 2499,
            originalPrice: 3499,
            discount: 28,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
            rating: 4.7,
            reviews: 89,
            colors: ['#FFFFFF', '#ADD8E6'],
            sizes: ['S', 'M', 'L', 'XL'],
            stock: 32,
            sold: 210,
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
                        <div key={product._id || product.id}>
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
