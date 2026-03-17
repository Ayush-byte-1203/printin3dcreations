import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Icon from './Icon';
import { topicsData, subProductsMap } from '../data/productsData';
import './CSS/ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const topic = topicsData.find(t => t.id === parseInt(id));
    const products = subProductsMap[id] || [];

    if (!topic) {
        return (
            <div className="container" style={{ padding: '150px 20px', textAlign: 'center' }}>
                <h2>Topic not found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    Go Back Home
                </button>
            </div>
        );
    }

    return (
        <div className="product-details-page">
            <div className="container">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <span>←</span> Back to Topics
                </button>

                <div className="topic-header">
                    <div className="topic-icon-large">
                        <Icon name={topic.icon} size={60} />
                    </div>
                    <div className="topic-text">
                        <span className="section-title">{topic.category}</span>
                        <h1>{topic.title} <span className="text-gradient">Collection</span></h1>
                        <p className="topic-full-desc">{topic.details}</p>
                    </div>
                </div>

                <div className="products-section">
                    <div className="section-header">
                        <h2>Available Designs</h2>
                        <p>Browse through our unique {topic.title} collection and click on a design to see full details.</p>
                    </div>

                    <div className="sub-products-grid">
                        {products.length > 0 ? (
                            products.map(product => (
                                <div 
                                    key={product.id} 
                                    className="glass-panel sub-product-card clickable-card"
                                    onClick={() => navigate(`/product/${id}/${product.id}`)}
                                >
                                    <div className="sub-card-image">
                                        {product.images && product.images[0] ? (
                                            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                                                 onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=3D+Model"; }} />
                                        ) : (
                                            <Icon name={topic.icon} size={40} opacity={0.3} />
                                        )}
                                    </div>
                                    <div className="sub-card-info">
                                        <h3>{product.name}</h3>
                                        <p className="sub-product-desc">{product.desc}</p>
                                        <div className="sub-card-footer">
                                            <span className="sub-card-price">₹{product.price}</span>
                                            <button
                                                className="btn btn-primary add-cart-btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart({ 
                                                        id: product.id, 
                                                        title: `${topic.title}: ${product.name}`, 
                                                        price: product.price, 
                                                        image: product.images ? product.images[0] : null
                                                    });
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-category-message">
                                <p>We're currently updating this collection with new designs. Stay tuned!</p>
                                <button className="btn btn-outline" onClick={() => navigate('/#contact')}>
                                    Inquire About Custom {topic.title}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
