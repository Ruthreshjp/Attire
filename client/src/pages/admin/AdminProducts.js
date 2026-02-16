import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminDashboard.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        category: '',
        newCategory: '',
        originalPrice: '',
        price: '', // This will be the discounted price
        stock: '',
        images: [{ url: '', alt: '', uploadMethod: 'url' }],
        tryOnImage: { url: '', uploadMethod: 'url' },
        colors: [{ name: '', hexCode: '#000000' }],
        sizes: [],
        tags: [],
        isSpecialOffer: false,
        couponCode: ''
    });

    const [categories, setCategories] = useState(['Watches', 'Eyewear', 'Bags', 'Wallets', 'Ties', 'Cufflinks', 'Belts', 'Accessories']);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            const data = await response.json();
            if (data.success) {
                setProducts(data.products);
                // Extract unique categories from products
                const existingCategories = [...new Set(data.products.map(p => p.category))];
                setCategories([...new Set([...categories, ...existingCategories])]);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleSizeToggle = (size) => {
        const sizes = [...newProduct.sizes];
        if (sizes.includes(size)) {
            setNewProduct({ ...newProduct, sizes: sizes.filter(s => s !== size) });
        } else {
            setNewProduct({ ...newProduct, sizes: [...sizes, size] });
        }
    };

    const handleAddImage = () => {
        setNewProduct({ ...newProduct, images: [...newProduct.images, { url: '', alt: '', uploadMethod: 'url' }] });
    };

    const handleImageChange = (index, field, value) => {
        const images = [...newProduct.images];
        images[index][field] = value;
        if (field === 'url') images[index].alt = newProduct.name;
        setNewProduct({ ...newProduct, images });
    };

    const handleProductImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleImageChange(index, 'url', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTryOnImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct({ ...newProduct, tryOnImage: { ...newProduct.tryOnImage, url: reader.result } });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddColor = () => {
        setNewProduct({ ...newProduct, colors: [...newProduct.colors, { name: '', hexCode: '#000000' }] });
    };

    const handleColorChange = (index, field, value) => {
        const colors = [...newProduct.colors];
        colors[index][field] = value;
        setNewProduct({ ...newProduct, colors });
    };

    const calculateDiscount = () => {
        if (!newProduct.originalPrice || !newProduct.price) return 0;
        const discount = ((newProduct.originalPrice - newProduct.price) / newProduct.originalPrice) * 100;
        return Math.round(discount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalCategory = newProduct.category === 'other' ? newProduct.newCategory : newProduct.category;

        const product = {
            ...newProduct,
            category: finalCategory,
            discount: calculateDiscount()
        };

        try {
            const url = isEditing
                ? `http://localhost:5000/api/products/${editingId}`
                : 'http://localhost:5000/api/products';

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') },
                body: JSON.stringify(product)
            });
            const data = await response.json();
            if (data.success) {
                if (isEditing) {
                    setProducts(products.map(p => (p._id === editingId ? data.product : p)));
                } else {
                    setProducts([data.product, ...products]);
                }

                if (!categories.includes(finalCategory)) {
                    setCategories([...categories, finalCategory]);
                }
                setIsAdding(false);
                setIsEditing(false);
                setEditingId(null);
                resetForm();
            }
        } catch (err) {
            console.error('Error saving product:', err);
        }
    };

    const handleEdit = (product) => {
        setNewProduct({
            ...product,
            newCategory: '',
            images: product.images.map(img => ({ ...img, uploadMethod: 'url' })),
            tryOnImage: product.tryOnImage || { url: '', uploadMethod: 'url' }
        });
        setEditingId(product._id);
        setIsEditing(true);
        setIsAdding(true); // Reuse the same modal
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            const data = await response.json();
            if (data.success) {
                setProducts(products.filter(p => p._id !== id));
            }
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    const resetForm = () => {
        setNewProduct({
            name: '',
            description: '',
            category: '',
            newCategory: '',
            originalPrice: '',
            price: '',
            stock: '',
            images: [{ url: '', alt: '', uploadMethod: 'url' }],
            tryOnImage: { url: '', uploadMethod: 'url' },
            colors: [{ name: '', hexCode: '#000000' }],
            sizes: [],
            tags: [],
            isSpecialOffer: false,
            couponCode: ''
        });
    };

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'];

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                {/* Product List at the Top */}
                <div className="listing-component-wrapper">
                    <header className="admin-header split-header">
                        <div className="header-info">
                            <h1>Product Catalog</h1>
                            <p>Manage your inventory and store listings</p>
                        </div>
                        <button className="add-btn" onClick={() => setIsAdding(true)}>+ Create New Product</button>
                    </header>

                    <div className="products-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Pricing</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan="5" className="empty-row">No products found in catalog</td></tr>
                                ) : (
                                    products.map(p => (
                                        <tr key={p._id || p.id}>
                                            <td className="product-cell">
                                                <div className="product-thumb">
                                                    {p.images && p.images[0] ? <img src={p.images[0].url} alt="" /> : 'N/A'}
                                                </div>
                                                <div className="product-meta">
                                                    <strong>{p.name}</strong>
                                                    <span>{p.tags?.join(', ')}</span>
                                                </div>
                                            </td>
                                            <td>{p.category}</td>
                                            <td>
                                                <div className="price-display">
                                                    {p.originalPrice && p.price < p.originalPrice ? (
                                                        <>
                                                            <span className="old-p">₹{p.originalPrice}</span>
                                                            <span className="new-p">₹{p.price}</span>
                                                        </>
                                                    ) : (
                                                        <span className="new-p">₹{p.price || p.originalPrice}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`stock-status ${p.stock < 10 ? 'low' : ''}`}>
                                                    {p.stock} in stock
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="icon-btn" onClick={() => handleEdit(p)}>✏️</button>
                                                    <button className="icon-btn delete" onClick={() => handleDelete(p._id)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isAdding && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal wide">
                            <div className="modal-header">
                                <h2>{isEditing ? 'Edit Product' : 'List New Product'}</h2>
                                <button className="close-btn" onClick={() => {
                                    setIsAdding(false);
                                    setIsEditing(false);
                                    setEditingId(null);
                                    resetForm();
                                }}>×</button>
                            </div>

                            <form onSubmit={handleSubmit} className="admin-form scrollable">
                                <section className="form-section">
                                    <h3>Basic Information</h3>
                                    <div className="form-group">
                                        <label>Product Title</label>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            value={newProduct.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Slim Fit Italian Linen Suit"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Detailed Description</label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            required
                                            value={newProduct.description}
                                            onChange={handleInputChange}
                                            placeholder="Tell customers more about your product..."
                                        ></textarea>
                                    </div>
                                </section>

                                <div className="form-grid-triple">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select name="category" value={newProduct.category} onChange={handleInputChange} required>
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="other">+ Add New Category</option>
                                        </select>
                                    </div>
                                    {newProduct.category === 'other' && (
                                        <div className="form-group">
                                            <label>New Category Name</label>
                                            <input
                                                name="newCategory"
                                                type="text"
                                                required
                                                value={newProduct.newCategory}
                                                onChange={handleInputChange}
                                                placeholder="Enter new category"
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Total Stock</label>
                                        <input
                                            name="stock"
                                            type="number"
                                            required
                                            value={newProduct.stock}
                                            onChange={handleInputChange}
                                            placeholder="Available units"
                                        />
                                    </div>
                                </div>

                                <section className="form-section special-offer-section">
                                    <div className="toggle-group">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={newProduct.isSpecialOffer}
                                                onChange={(e) => setNewProduct({ ...newProduct, isSpecialOffer: e.target.checked })}
                                            />
                                            <span className="toggle-text">Enable Special Offer</span>
                                        </label>
                                    </div>
                                    {newProduct.isSpecialOffer && (
                                        <div className="form-group fadeIn">
                                            <label>Coupon Code</label>
                                            <input
                                                name="couponCode"
                                                type="text"
                                                required
                                                value={newProduct.couponCode}
                                                onChange={handleInputChange}
                                                placeholder="e.g., FESTIVE50"
                                            />
                                            <small>This code will be displayed in the Special Offers section.</small>
                                        </div>
                                    )}
                                </section>

                                <section className="form-section dark-bg">
                                    <h3>Pricing & Valuation</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Original Price (MRP)</label>
                                            <div className="price-input">
                                                <span>₹</span>
                                                <input
                                                    name="originalPrice"
                                                    type="number"
                                                    required
                                                    value={newProduct.originalPrice}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Sale Price (Optional)</label>
                                            <div className="price-input">
                                                <span>₹</span>
                                                <input
                                                    name="price"
                                                    type="number"
                                                    value={newProduct.price}
                                                    onChange={handleInputChange}
                                                    placeholder="Discounted price"
                                                />
                                            </div>
                                            {newProduct.price && calculateDiscount() > 0 && (
                                                <span className="discount-calc">
                                                    Effective Discount: <strong>{calculateDiscount()}% OFF</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="form-section">
                                    <h3>Product Visuals</h3>
                                    {newProduct.images.map((img, idx) => (
                                        <div key={idx} className="image-input-container">
                                            <div className="upload-tabs">
                                                <button
                                                    type="button"
                                                    className={`tab-btn ${img.uploadMethod === 'url' ? 'active' : ''}`}
                                                    onClick={() => handleImageChange(idx, 'uploadMethod', 'url')}
                                                >
                                                    URL
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`tab-btn ${img.uploadMethod === 'upload' ? 'active' : ''}`}
                                                    onClick={() => handleImageChange(idx, 'uploadMethod', 'upload')}
                                                >
                                                    Upload
                                                </button>
                                            </div>

                                            {img.uploadMethod === 'url' ? (
                                                <div className="form-group">
                                                    <label>Image URL {idx + 1}</label>
                                                    <input
                                                        type="text"
                                                        value={img.url}
                                                        onChange={(e) => handleImageChange(idx, 'url', e.target.value)}
                                                        placeholder="https://images.unsplash.com/..."
                                                    />
                                                </div>
                                            ) : (
                                                <div className="form-group">
                                                    <label>Upload Image {idx + 1}</label>
                                                    <div className="file-upload-wrapper">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleProductImageUpload(idx, e)}
                                                            className="file-input"
                                                            id={`product-img-${idx}`}
                                                        />
                                                        <label htmlFor={`product-img-${idx}`} className="file-label">
                                                            {img.url ? "✓ Image Uploaded" : "📁 Choose Image File"}
                                                        </label>
                                                        {img.url && <div className="image-preview-mini"><img src={img.url} alt="" /></div>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="text-btn" onClick={handleAddImage}>+ Add Another Image</button>
                                </section>

                                <section className="form-section try-on-section">
                                    <h3>Virtual Try-On (Beta)</h3>
                                    <p className="section-hint">Upload a transparent PNG image of the product for virtual try-on features.</p>
                                    <div className="upload-tabs">
                                        <button
                                            type="button"
                                            className={`tab-btn ${newProduct.tryOnImage.uploadMethod === 'url' ? 'active' : ''}`}
                                            onClick={() => setNewProduct({ ...newProduct, tryOnImage: { ...newProduct.tryOnImage, uploadMethod: 'url' } })}
                                        >
                                            URL
                                        </button>
                                        <button
                                            type="button"
                                            className={`tab-btn ${newProduct.tryOnImage.uploadMethod === 'upload' ? 'active' : ''}`}
                                            onClick={() => setNewProduct({ ...newProduct, tryOnImage: { ...newProduct.tryOnImage, uploadMethod: 'upload' } })}
                                        >
                                            Upload
                                        </button>
                                    </div>

                                    {newProduct.tryOnImage.uploadMethod === 'url' ? (
                                        <div className="form-group">
                                            <label>Try-On Image URL</label>
                                            <input
                                                type="text"
                                                value={newProduct.tryOnImage.url}
                                                onChange={(e) => setNewProduct({ ...newProduct, tryOnImage: { ...newProduct.tryOnImage, url: e.target.value } })}
                                                placeholder="Link to transparent PNG..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>Upload Try-On Image</label>
                                            <div className="file-upload-wrapper">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleTryOnImageUpload}
                                                    className="file-input"
                                                    id="tryon-img-upload"
                                                />
                                                <label htmlFor="tryon-img-upload" className="file-label">
                                                    {newProduct.tryOnImage.url ? "✓ Image Ready" : "📁 Select Try-On Graphic"}
                                                </label>
                                                {newProduct.tryOnImage.url && <div className="image-preview-mini"><img src={newProduct.tryOnImage.url} alt="" /></div>}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                <section className="form-section">
                                    <h3>Variants (Colors & Sizes)</h3>
                                    <div className="colors-list">
                                        {newProduct.colors.map((color, idx) => (
                                            <div key={idx} className="color-input-row">
                                                <input
                                                    type="text"
                                                    placeholder="Color name"
                                                    value={color.name}
                                                    onChange={(e) => handleColorChange(idx, 'name', e.target.value)}
                                                />
                                                <input
                                                    type="color"
                                                    value={color.hexCode}
                                                    onChange={(e) => handleColorChange(idx, 'hexCode', e.target.value)}
                                                />
                                            </div>
                                        ))}
                                        <button type="button" className="text-btn" onClick={handleAddColor}>+ Add Color Variant</button>
                                    </div>

                                    <div className="sizes-grid">
                                        <label className="full-width">Available Sizes</label>
                                        {availableSizes.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`size-chip ${newProduct.sizes.includes(size) ? 'selected' : ''}`}
                                                onClick={() => handleSizeToggle(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <div className="form-actions sticky">
                                    <button type="button" className="cancel-btn" onClick={() => {
                                        setIsAdding(false);
                                        setIsEditing(false);
                                        setEditingId(null);
                                        resetForm();
                                    }}>Discard Changes</button>
                                    <button type="submit" className="save-btn large">{isEditing ? 'Save Changes' : 'Publish Product to Store'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .admin-main {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px;
                }

                .listing-component-wrapper {
                    width: 100%;
                    max-width: 1200px;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .admin-header.split-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }

                .products-table-container {
                    width: 100%;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }
                .admin-table th, 
                .admin-table td {
                    text-align: center !important;
                    vertical-align: middle;
                }

                .product-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                }
                
                .product-meta {
                    text-align: left;
                }

                .price-display {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .action-btns {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }

                .admin-modal.wide {
                    max-width: 800px;
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                }

                .modal-header {
                    padding: 25px 40px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .close-btn { 
                    position: absolute;
                    right: 25px;
                    background: none; 
                    border: none; 
                    font-size: 2rem; 
                    cursor: pointer; 
                    color: #999; 
                }

                .admin-form.scrollable {
                    overflow-y: auto;
                    padding: 30px 40px;
                    flex: 1;
                }

                .form-section { margin-bottom: 40px; }
                .form-section h3 { 
                    font-size: 1.1rem; 
                    margin-bottom: 20px; 
                    color: #1a1a1a; 
                    text-align: center;
                }
                .dark-bg { background: #f8f9fa; padding: 25px; border-radius: 12px; }
                .form-grid-triple { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .price-input { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
                .price-input span { background: #eee; padding: 12px 15px; border-right: 1px solid #ddd; }
                .price-input input { border: none !important; border-radius: 0 !important; }
                .discount-calc { display: block; margin-top: 8px; font-size: 0.85rem; color: #2e7d32; }
                .text-btn { background: none; border: none; color: #1a1a1a; font-weight: 600; text-decoration: underline; margin-top: 10px; cursor: pointer; }
                
                .color-input-row { display: flex; gap: 10px; margin-bottom: 10px; }
                .color-input-row input[type="text"] { flex: 1; }
                .color-input-row input[type="color"] { width: 50px; padding: 2px; }
                
                .sizes-grid { display: flex; flex-wrap: wrap; gap: 10px; width: 100%; }
                .size-chip { 
                    padding: 8px 15px; border: 1px solid #ddd; border-radius: 6px; 
                    background: white; cursor: pointer; transition: all 0.2s;
                }
                .size-chip.selected { background: #1a1a1a; color: white; border-color: #1a1a1a; }
                
                .form-actions.sticky {
                    position: sticky;
                    bottom: 0;
                    background: white;
                    padding: 20px 40px;
                    border-top: 1px solid #eee;
                    margin: 0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                }
                .save-btn.large { padding: 15px 30px; }
                
                .product-thumb { width: 50px; height: 50px; background: #eee; border-radius: 6px; overflow: hidden; }
                .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .product-meta span { font-size: 0.75rem; color: #999; display: block; }
                
                .old-p { text-decoration: line-through; color: #999; font-size: 0.8rem; }
                .new-p { font-weight: 700; }
                
                .empty-row { text-align: center; padding: 50px !important; color: #999; }
                
                .special-offer-section { background: #fff8e1; padding: 20px; border-radius: 12px; border: 1px dashed #ffc107; }
                .toggle-group { display: flex; align-items: center; margin-bottom: 10px; }
                .toggle-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 600; }
                .toggle-label input { width: 20px; height: 20px; cursor: pointer; }
                .fadeIn { animation: fadeIn 0.3s ease-in; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                /* Premium Form Styling */
                .admin-form .form-group {
                    margin-bottom: 25px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .admin-form label {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #4a5568;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .admin-form input[type="text"],
                .admin-form input[type="number"],
                .admin-form select,
                .admin-form textarea {
                    width: 100%;
                    padding: 12px 18px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    background: #fff;
                    font-size: 1rem;
                    color: #1a202c;
                    transition: all 0.3s ease;
                    outline: none;
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
                }

                .admin-form select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 15px center;
                    background-size: 18px;
                    padding-right: 45px;
                    cursor: pointer;
                }

                .admin-form input:focus,
                .admin-form select:focus,
                .admin-form textarea:focus {
                    border-color: #1a1a1a;
                    box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
                    background-color: #fcfcfc;
                }

                .admin-form input::placeholder,
                .admin-form textarea::placeholder {
                    color: #a0aec0;
                    font-size: 0.95rem;
                }

                .admin-form textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .price-input input {
                    border-left: none !important;
                    border-top-left-radius: 0 !important;
                    border-bottom-left-radius: 0 !important;
                }

                /* Upload Tabs & File Styling */
                .image-input-container {
                    background: #fcfcfc;
                    padding: 15px;
                    border-radius: 12px;
                    border: 1px solid #edf2f7;
                    margin-bottom: 20px;
                }
                .upload-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .tab-btn {
                    flex: 1;
                    padding: 8px;
                    background: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #718096;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .tab-btn.active {
                    background: #1a1a1a;
                    color: white;
                    border-color: #1a1a1a;
                }
                .file-upload-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .file-input { display: none; }
                .file-label {
                    flex: 1;
                    padding: 12px;
                    background: white;
                    border: 2px dashed #cbd5e0;
                    border-radius: 10px;
                    text-align: center;
                    font-weight: 600;
                    color: #4a5568;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .file-label:hover {
                    border-color: #1a1a1a;
                    background: #f7fafc;
                }
                .image-preview-mini {
                    width: 50px;
                    height: 50px;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    flex-shrink: 0;
                }
                .image-preview-mini img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .try-on-section {
                    background: #ebf8ff;
                    border: 1px solid #bee3f8;
                    padding: 25px;
                    border-radius: 12px;
                }
                .section-hint {
                    font-size: 0.85rem;
                    color: #2b6cb0;
                    margin-bottom: 15px;
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
