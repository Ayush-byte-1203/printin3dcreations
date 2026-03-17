import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Icon from './Icon';
import { topicsData, subProductsMap } from '../data/productsData';
import './CSS/SubProductDetails.css';

const SubProductDetails = () => {
    const { topicId, productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);

    const topic = topicsData.find(t => t.id === parseInt(topicId));
    const productsInTopic = subProductsMap[topicId] || [];
    const product = productsInTopic.find(p => p.id === productId);

    if (!product || !topic) {
        return (
            <div className="container" style={{ padding: '150px 20px', textAlign: 'center' }}>
                <h2>Product not found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    Go Back Home
                </button>
            </div>
        );
    }

    // Use product.images if they exist, otherwise use placeholders
    const images = product.images && product.images.length > 0 
        ? product.images.map((img, idx) => ({ type: 'image', content: img, label: idx === 0 ? 'Main View' : `View ${idx + 1}` }))
        : [
            { type: 'icon', content: topic.icon, label: '3D Preview' },
            { type: 'color', content: '#f8f9fa', label: 'Side View' },
            { type: 'color', content: '#f0f2f5', label: 'Top View' }
        ];

    return (
        <div className="sub-product-details-page">
            <div className="container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <span>←</span> Back to {topic.title}
                </button>

                <div className="product-main-grid">
                    {/* Left: Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image-container glass-panel">
                            {images[selectedImage].type === 'image' ? (
                                <img src={images[selectedImage].content} alt={product.name} className="product-main-img" 
                                     onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600x400?text=Product+Image"; }} />
                            ) : images[selectedImage].type === 'icon' ? (
                                <Icon name={images[selectedImage].content} size={120} opacity={0.2} />
                            ) : (
                                <div className="placeholder-image" style={{ backgroundColor: images[selectedImage].content }}>
                                    <Icon name={topic.icon} size={80} opacity={0.1} />
                                    <p>{images[selectedImage].label} Placeholder</p>
                                </div>
                            )}
                        </div>
                        <div className="thumbnail-grid">
                            {images.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className={`thumbnail glass-panel ${selectedImage === idx ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(idx)}
                                >
                                    {img.type === 'image' ? (
                                        <img src={img.content} alt={img.label} className="thumb-img" 
                                             onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80?text=Img"; }} />
                                    ) : img.type === 'icon' ? (
                                        <Icon name={img.content} size={24} />
                                    ) : (
                                        <div className="thumb-placeholder" style={{ backgroundColor: img.content }}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="product-info-section">
                        <span className="product-category-tag">{topic.title} Collection</span>
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-price">₹{product.price}</p>
                        
                        <div className="product-description-box">
                            <h3>Description</h3>
                            <p>{product.fullDetails}</p>
                        </div>

                        <div className="product-specs-grid">
                            <div className="spec-item">
                                <span className="spec-label">Material</span>
                                <span className="spec-value">{product.specs.material || 'Premium PLA'}</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Size</span>
                                <span className="spec-value">{product.specs.dimensions || product.specs.scale || 'N/A'}</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Weight</span>
                                <span className="spec-value">{product.specs.weight || 'Lightweight'}</span>
                            </div>
                        </div>

                        <div className="product-features-list">
                            <h3>Key Features</h3>
                            <ul>
                                {product.features.map((feature, idx) => (
                                    <li key={idx}>✓ {feature}</li>
                                ))}
                            </ul>
                        </div>

                        <button 
                            className="btn btn-primary buy-btn"
                            onClick={() => addToCart({ 
                                id: product.id, 
                                title: `${topic.title}: ${product.name}`, 
                                price: product.price, 
                                image: product.images ? product.images[0] : null
                            })}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubProductDetails;
