import React, { useState, useMemo } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
    Search,
    Info,
    Truck,
    Package,
    CreditCard,
    Plus,
    Minus,
    HelpCircle
} from 'lucide-react';
import './CSS/FAQ.css';

export const faqData = [
    {
        category: "General",
        icon: Info,
        items: [
            {
                q: "What is 3D printing and how does it work?",
                a: "3D printing, or additive manufacturing, is the process of making three-dimensional solid objects from a digital file. Our printers build objects layer-by-layer using high-quality PLA plastic."
            },
            {
                q: "Is the material durable?",
                a: "We use PLA and PETG, depending on the product. Check the material listed in each product specification. The right choice depends on whether the print is decorative or functional; discuss heat, outdoor use and load requirements with us before ordering."
            }
        ]
    },
    {
        category: "Ordering",
        icon: Package,
        items: [
            {
                q: "How do I place a custom order?",
                a: "Choose a product and any available text or colour options, add it to your cart, and complete the order details to send your request through WhatsApp. For a new design, contact us with your idea, dimensions and quantity so we can discuss a quote."
            },
            {
                q: "Can I cancel my order?",
                a: "Our return policy allows cancellations only within 2 hours of order placement. Contact us promptly on WhatsApp and read the cancellation terms before payment; custom prints are made to order."
            }
        ]
    },
    {
        category: "Custom Printing",
        icon: Package,
        items: [
            { q: "How much does custom 3D printing cost?", a: "Catalog products show their price in rupees. A custom design needs an individual quote because size, material, detail and quantity affect the work involved. Share your requirements on WhatsApp; we will confirm the price and delivery details before you order." },
            { q: "Can you print my own design or prototype?", a: "Yes. Our custom design service starts with your design, sketch or concept. Tell us the intended use, dimensions, preferred colours and quantity on WhatsApp. We will discuss what can be printed and confirm the design requirements before production." },
            { q: "Do you deliver 3D printed gifts across India?", a: "Yes, Print-IN 3D offers delivery across India for our 3D printed products. You can order personalized keychains, home decor, desk accessories and models from the catalog. Delivery timing depends on manufacturing and your location; confirm the estimate when ordering." }
        ]
    },
    {
        category: "Shipping",
        icon: Truck,
        items: [
            {
                q: "How long does shipping take?",
                a: "Printing typically takes 1-3 days. Standard delivery takes 5-7 business days after manufacturing, depending on your location and courier. Confirm your delivery estimate with us on WhatsApp before placing a time-sensitive order."
            },
            {
                q: "Do you offer tracking?",
                a: "Yes! Once your order is shipped, we will share the tracking link with you directly on WhatsApp."
            }
        ]
    },
    {
        category: "Payments",
        icon: CreditCard,
        items: [
            {
                q: "How do I pay?",
                a: "We currently accept payments via UPI, Google Pay, and PhonePe. Payment details are shared during our WhatsApp consultation."
            }
        ]
    }
];

const FAQ = ({ standalone = false }) => {
    const revealRef = useScrollReveal();
    const Heading = standalone ? 'h1' : 'h2';
    const [openIndex, setOpenIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...faqData.map(d => d.category)];

    const filteredData = useMemo(() => {
        let data = faqData;
        if (activeCategory !== 'All') {
            data = faqData.filter(d => d.category === activeCategory);
        }
        if (searchQuery.trim()) {
            return data.map(section => ({
                ...section,
                items: section.items.filter(item =>
                    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.a.toLowerCase().includes(searchQuery.toLowerCase())
                )
            })).filter(section => section.items.length > 0);
        }
        return data;
    }, [activeCategory, searchQuery]);

    const toggleFAQ = (id) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <section className={`faq-premium ${standalone ? 'standalone' : ''}`} id="faq">
            <div className="container" ref={revealRef}>

                {/* ── Support Hero ── */}
                <div className="header-centered-p reveal-hidden">
                    <span className="eyebrow">Help Center</span>
                    <Heading className="faq-title-main">Common Questions</Heading>
                    <p className="faq-subtitle">
                        Can't find what you're looking for? Reach out to our human support team.
                    </p>

                    {standalone && (
                        <div className="faq-search-wrap">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* ── Category Chips ── */}
                {standalone && (
                    <div className="faq-categories-wrap reveal-hidden">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                <div className="faq-main-content">
                    {filteredData.length > 0 ? (
                        filteredData.map((section, sIdx) => {
                            const CategoryIcon = section.icon;
                            return (
                                <div key={sIdx} className="faq-group reveal-hidden reveal-stagger-1">
                                    <div className="faq-group-header">
                                        <CategoryIcon size={18} />
                                        <h3>{section.category}</h3>
                                    </div>
                                    <div className="faq-accordion">
                                        {section.items.map((item, iIdx) => {
                                            const id = `${sIdx}-${iIdx}`;
                                            const isOpen = openIndex === id;
                                            return (
                                                <div key={id} className={`faq-row ${isOpen ? 'active' : ''}`}>
                                                    <button className="faq-trigger" aria-expanded={isOpen} aria-controls={`faq-answer-${id}`} onClick={() => toggleFAQ(id)}>
                                                        <span className="q-text">{item.q}</span>
                                                        <div className="q-icon">
                                                            {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                                        </div>
                                                    </button>
                                                    <div className="faq-content" id={`faq-answer-${id}`}>
                                                        <div className="faq-content-inner">
                                                            <p>{item.a}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="faq-no-results">
                            <HelpCircle size={48} />
                            <p>No matches found for "{searchQuery}"</p>
                            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>Clear Filters</button>
                        </div>
                    )}
                </div>

                {/* ── Human Support CTA ── */}

            </div>
        </section>
    );
};

export default FAQ;
