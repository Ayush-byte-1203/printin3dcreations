import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './CSS/Contact.css';

const Contact = () => {
    const form = useRef();
    const [type, setType] = useState('say-hi');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (type === 'quote') {
            const phoneNumber = "917043591952"; // Replace with your actual business number
            const text = `Hi Print-IN, I'm ${formData.name}. I'd like to place a new order. Details: ${formData.message}`;
            const encodedText = encodeURIComponent(text);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
            window.open(whatsappUrl, '_blank');
        } else {
            // Handle General QA (e.g., email or API call)
            emailjs.sendForm('service_xvvx1of', 'template_g72lmq6', form.current, 'PJWLNVamk0BXaXntd')
                .then((result) => {
                    console.log(result.text);
                    alert(`Thanks ${formData.name}! We've received your inquiry.`);
                    setFormData({ name: '', email: '', message: '' });
                }, (error) => {
                    console.log(error.text);
                    alert('FAILED...', error);
                });
        }
    };

    return (
        <section id="contact" className="contact">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Start Your Project</h2>
                    <h3 className="heading-secondary">What do you want to create?</h3>
                    <p className="section-desc">Fill out the form below and we'll get back to you with a quote and timeline.</p>
                </div>

                <div className="contact-wrapper glass-panel">
                    <div className="contact-form-container">
                        <form className="contact-form" ref={form} onSubmit={handleSubmit}>
                            <div className="form-type-toggle">
                                <label className={`radio-label ${type === 'say-hi' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="say-hi"
                                        checked={type === 'say-hi'}
                                        onChange={() => setType('say-hi')}
                                    />
                                    General QA
                                </label>
                                <label className={`radio-label ${type === 'quote' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="quote"
                                        checked={type === 'quote'}
                                        onChange={() => setType('quote')}
                                    />
                                    New Order
                                </label>
                            </div>

                            <div className="input-group">
                                <label htmlFor="name">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="John Doe"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {type === 'say-hi' && (
                                <div className="input-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="john@example.com"
                                        required
                                        className="input-field"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}



                            <div className="input-group">
                                <label htmlFor="message">Tell us about your idea</label>
                                <textarea
                                    id="message"
                                    placeholder="I want to print a custom figurine..."
                                    rows="5"
                                    required
                                    className="input-field"
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary submit-btn">
                                {type === 'quote' ? 'Send via WhatsApp' : 'Submit Inquiry'}
                            </button>
                        </form>
                    </div>

                    <div className="contact-visual">
                        <div className="visual-content">
                            <h4>Let's make it happen</h4>
                            <p>We are excited to see what you create.</p>
                            <div className="contact-info-card">
                                <span>📧 printin3dcreations@gmail.com</span>
                                <span>📱 +91 70435 91952</span>
                            </div>
                        </div>
                        <div className="glow-orb"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
