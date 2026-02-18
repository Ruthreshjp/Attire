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
        colors: [{ name: '', hexCode: '#000000', images: [{ url: '', alt: '', uploadMethod: 'url' }] }],
        sizes: [],
        tags: [],
        isSpecialOffer: false,
        couponCode: ''
    });

    const [categories, setCategories] = useState(['shirts', 'pants', 't-shirts', 'joggers', 'jackets', 'suits', 'accessories']);
    const [isDirty, setIsDirty] = useState(false);
    const markDirty = () => setIsDirty(true);

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
        markDirty();
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


    const handleAddColor = () => {
        setNewProduct({
            ...newProduct,
            colors: [...newProduct.colors, { name: '', hexCode: '#000000', images: [{ url: '', alt: '', uploadMethod: 'url' }] }]
        });
    };

    const handleColorChange = (index, field, value) => {
        const colors = [...newProduct.colors];
        colors[index][field] = value;
        setNewProduct({ ...newProduct, colors });
    };

    const handleAddColorImage = (colorIdx) => {
        const colors = [...newProduct.colors];
        colors[colorIdx].images.push({ url: '', alt: '', uploadMethod: 'url' });
        setNewProduct({ ...newProduct, colors });
    };

    const handleColorImageChange = (colorIdx, imgIdx, field, value) => {
        const colors = [...newProduct.colors];
        colors[colorIdx].images[imgIdx][field] = value;
        if (field === 'url') colors[colorIdx].images[imgIdx].alt = `${newProduct.name} - ${colors[colorIdx].name}`;
        setNewProduct({ ...newProduct, colors });
    };

    const handleColorImageUpload = (colorIdx, imgIdx, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleColorImageChange(colorIdx, imgIdx, 'url', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateDiscount = () => {
        if (!newProduct.originalPrice || !newProduct.price) return 0;
        const discount = ((newProduct.originalPrice - newProduct.price) / newProduct.originalPrice) * 100;
        return Math.round(discount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalCategory = newProduct.category === 'other' ? newProduct.newCategory : newProduct.category;

        // Consolidate images: The first image of the first color will be used as the primary display image
        // if no global images exist (though we are moving to color-first)
        const allImages = newProduct.colors.flatMap(c => c.images).filter(img => img.url);

        const product = {
            ...newProduct,
            category: finalCategory,
            images: allImages, // Populate global images from color images for compatibility
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
            images: product.images.map(img => ({ ...img, uploadMethod: 'url' }))
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
                                    <th>Available Stock</th>
                                    <th>Total Stock</th>
                                    <th>Sold</th>
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
                                                    {p.images && p.images[0] ? (
                                                        <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt="" />
                                                    ) : 'N/A'}
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
                                                    {p.stock} units
                                                </span>
                                            </td>
                                            <td>
                                                <span>{(p.stock || 0) + (p.sold || 0)} units</span>
                                            </td>
                                            <td>
                                                <span className="sold-count">{p.sold || 0} sold</span>
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

                                <section className="form-section color-first-visuals">
                                    <div className="section-header-admin">
                                        <h3>Product Visuals & Color Variants</h3>
                                        <p>First, add a color, then attach images specific to that color.</p>
                                    </div>

                                    <div className="advanced-colors-list">
                                        {newProduct.colors.map((color, colorIdx) => (
                                            <div key={colorIdx} className="color-variant-block premium-card">
                                                <div className="color-header-row">
                                                    <div className="color-basic-info">
                                                        <div className="form-group-compact">
                                                            <label>Color Name</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g., Midnight Blue"
                                                                value={color.name}
                                                                onChange={(e) => {
                                                                    handleColorChange(colorIdx, 'name', e.target.value);
                                                                    markDirty();
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="form-group-compact">
                                                            <label>Preview Swatch</label>
                                                            <input
                                                                type="color"
                                                                value={color.hexCode}
                                                                onChange={(e) => {
                                                                    handleColorChange(colorIdx, 'hexCode', e.target.value);
                                                                    markDirty();
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {newProduct.colors.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="remove-color-btn"
                                                            onClick={() => {
                                                                const colors = newProduct.colors.filter((_, i) => i !== colorIdx);
                                                                setNewProduct({ ...newProduct, colors });
                                                                markDirty();
                                                            }}
                                                        >🗑️ Remove Color</button>
                                                    )}
                                                </div>

                                                <div className="color-images-section">
                                                    <label className="sub-label">Images for {color.name || 'this color'}</label>
                                                    <div className="color-images-grid-enhanced">
                                                        {color.images.map((img, imgIdx) => (
                                                            <div key={imgIdx} className="enhanced-image-card">
                                                                <div className="mini-upload-tabs">
                                                                    <button
                                                                        type="button"
                                                                        className={img.uploadMethod === 'url' ? 'active' : ''}
                                                                        onClick={() => handleColorImageChange(colorIdx, imgIdx, 'uploadMethod', 'url')}
                                                                    >URL</button>
                                                                    <button
                                                                        type="button"
                                                                        className={img.uploadMethod === 'upload' ? 'active' : ''}
                                                                        onClick={() => handleColorImageChange(colorIdx, imgIdx, 'uploadMethod', 'upload')}
                                                                    >File</button>
                                                                </div>

                                                                <div className="image-input-area">
                                                                    {img.uploadMethod === 'url' ? (
                                                                        <input
                                                                            type="text"
                                                                            placeholder="https://..."
                                                                            value={img.url}
                                                                            onChange={(e) => {
                                                                                handleColorImageChange(colorIdx, imgIdx, 'url', e.target.value);
                                                                                markDirty();
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="mini-file-upload">
                                                                            <input
                                                                                type="file"
                                                                                id={`color-${colorIdx}-img-${imgIdx}`}
                                                                                onChange={(e) => {
                                                                                    handleColorImageUpload(colorIdx, imgIdx, e);
                                                                                    markDirty();
                                                                                }}
                                                                                style={{ display: 'none' }}
                                                                            />
                                                                            <label htmlFor={`color-${colorIdx}-img-${imgIdx}`} className="mini-dropzone">
                                                                                {img.url ? '✓ Image Ready' : '📁 Select'}
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {img.url && (
                                                                    <div className="mini-preview-wrap">
                                                                        <img src={img.url} alt="preview" />
                                                                        <button
                                                                            type="button"
                                                                            className="delete-img-float"
                                                                            onClick={() => {
                                                                                const images = color.images.filter((_, i) => i !== imgIdx);
                                                                                const colors = [...newProduct.colors];
                                                                                colors[colorIdx].images = images;
                                                                                setNewProduct({ ...newProduct, colors });
                                                                                markDirty();
                                                                            }}
                                                                        >×</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            className="add-image-card-btn"
                                                            onClick={() => {
                                                                handleAddColorImage(colorIdx);
                                                                markDirty();
                                                            }}
                                                        >
                                                            <span className="plus">+</span>
                                                            <span>Add Image</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="add-color-btn-large"
                                            onClick={() => {
                                                handleAddColor();
                                                markDirty();
                                            }}
                                        >
                                            ✨ Add Another Color Variant
                                        </button>
                                    </div>

                                    <div className="sizes-grid-enhanced">
                                        <label className="full-width">Available Sizes for this Product</label>
                                        <div className="chips-container">
                                            {availableSizes.map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    className={`size-chip-enhanced ${newProduct.sizes.includes(size) ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        handleSizeToggle(size);
                                                        markDirty();
                                                    }}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <div className="form-actions sticky">
                                    {isDirty && <span className="dirty-tag">⚠️ Unsaved Changes</span>}
                                    <button type="button" className="cancel-btn" onClick={() => {
                                        setIsAdding(false);
                                        setIsEditing(false);
                                        setEditingId(null);
                                        resetForm();
                                        setIsDirty(false);
                                    }}>Discard</button>
                                    <button type="submit" className="save-btn large">{isEditing ? 'Save Changes' : 'Publish Product'}</button>
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
                    padding: 15px 10px;
                }

                .stock-status {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .stock-status.low {
                    background: #fff5f5;
                    color: #e53e3e;
                }
                .sold-count {
                    font-weight: 600;
                    color: #2b6cb0;
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
                
                .color-variant-block {
                    background: #fdfdfd;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 25px;
                }
                .color-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .color-basic-info {
                    display: flex;
                    gap: 10px;
                    flex: 1;
                }
                .remove-color-btn {
                    background: #fff5f5;
                    color: #e53e3e;
                    border: 1px solid #fed7d7;
                    padding: 8px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                .color-images-section label {
                    display: block;
                    margin-bottom: 12px;
                    font-size: 0.8rem;
                    color: #718096;
                }
                .color-images-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .color-image-item {
                    position: relative;
                    width: 120px;
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .mini-upload-tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 8px;
                }
                .mini-upload-tabs button {
                    flex: 1;
                    font-size: 0.65rem;
                    padding: 4px;
                    border: 1px solid #eee;
                    background: #f8f9fa;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .mini-upload-tabs button.active {
                    background: #1a1a1a;
                    color: white;
                    border-color: #1a1a1a;
                }
                .color-first-visuals {
                    background: #fff;
                    padding: 0;
                }
                .premium-card {
                    background: #fcfcfc;
                    border: 1px solid #eef2f6;
                    border-radius: 16px;
                    padding: 25px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .form-group-compact {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                }
                .form-group-compact label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .color-images-grid-enhanced {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                .enhanced-image-card {
                    background: white;
                    border: 1px solid #edf2f7;
                    border-radius: 12px;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    position: relative;
                }
                .mini-preview-wrap {
                    height: 100px;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }
                .mini-preview-wrap img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .delete-img-float {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(229, 62, 62, 0.9);
                    color: white;
                    border: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }
                .add-image-card-btn {
                    height: 100%;
                    min-height: 150px;
                    border: 2px dashed #e2e8f0;
                    background: #f8fafc;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .add-image-card-btn:hover {
                    border-color: #cbd5e1;
                    background: #f1f5f9;
                    color: #64748b;
                }
                .add-color-btn-large {
                    width: 100%;
                    padding: 15px;
                    background: #fff;
                    border: 2px dashed #c5a059;
                    color: #c5a059;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .add-color-btn-large:hover {
                    background: #fffaf0;
                    transform: translateY(-2px);
                }
                .dirty-tag {
                    color: #c5a059;
                    font-weight: 700;
                    font-size: 0.8rem;
                    margin-right: auto;
                }
                .mini-dropzone {
                    display: block;
                    padding: 8px;
                    border: 1px dashed #cbd5e1;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    text-align: center;
                    cursor: pointer;
                }
                .chips-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 10px;
                }
                .size-chip-enhanced {
                    padding: 8px 16px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .size-chip-enhanced.selected {
                    background: #1a1a1a;
                    color: white;
                    border-color: #1a1a1a;
                }
                    border: 1px solid #eee;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .mini-upload-tabs button {
                    flex: 1;
                    padding: 3px;
                    border: none;
                    background: #f8f9fa;
                    cursor: pointer;
                }
                .mini-upload-tabs button.active {
                    background: #1a1a1a;
                    color: white;
                }
                .mini-file-upload input { display: none; }
                .mini-file-upload label {
                    display: block;
                    padding: 5px;
                    background: #f1f1f1;
                    border-radius: 4px;
                    text-align: center;
                    cursor: pointer;
                    font-size: 0.7rem;
                    margin: 0;
                }
                .color-image-item input[type="text"] {
                    font-size: 0.7rem;
                    padding: 5px;
                }
                .mini-img-preview {
                    width: 100%;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .btn-delete-img {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 20px;
                    height: 20px;
                    background: #ff4d4f;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 12px;
                }
                .add-color-image-btn {
                    width: 120px;
                    height: 150px;
                    border: 2px dashed #eee;
                    border-radius: 8px;
                    background: none;
                    font-size: 1.5rem;
                    color: #ccc;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .add-color-image-btn:hover {
                    border-color: #1a1a1a;
                    color: #1a1a1a;
                    background: #fcfcfc;
                }
                
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
            `}</style>
        </div>
    );
};

export default AdminProducts;
