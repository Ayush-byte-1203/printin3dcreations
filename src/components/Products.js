import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { topicsData } from '../data/productsData';
import './CSS/Products.css';

const Products = () => {
    const navigate = useNavigate();

    const handleTopicClick = (topic) => {
        if (topic.id === 1) {
            // Redirect id 1 (Custom Design) to contact section
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/'); // fallback if not on home
                setTimeout(() => {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            // Redirect others to details page (which shows sub-products)
            navigate(`/product/${topic.id}`);
        }
    };

    return (
        <section id="products" className="products">
            <div className="container">
                <div className="section-header center" style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 className="section-title">Product Topics</h2>
                    <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Explore Our <span className="text-gradient">3D Collections</span></h1>
                    <p className="section-desc" style={{ margin: '0 auto' }}>Choose a topic to discover our range of specialized 3D-printed creations and custom solutions.</p>
                </div>

                <div className="products-grid">
                    {topicsData.map((topic) => (
                        <div key={topic.id} className="glass-panel product-card" onClick={() => handleTopicClick(topic)}>
                            <div className="card-image-wrapper">
                                <Icon name={topic.icon} size={48} className="product-icon" />
                            </div>
                            <div className="product-info">
                                <span className="product-category">{topic.category}</span>
                                <h3>{topic.title}</h3>
                                <p>{topic.desc}</p>
                            </div>
                            <button className="btn-text">
                                {topic.id === 1 ? 'Contact Us →' : 'View Products →'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Products;
