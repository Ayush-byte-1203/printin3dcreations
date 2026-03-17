import React, { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './CSS/Navbar.css';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { toggleCart, cartCount } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navbar is only transparent at the top of the Home page
    const isHomePage = location.pathname === '/';
    const navbarClass = (isScrolled || !isHomePage) ? 'navbar-dark' : 'navbar-transparent';

    return (
        <nav className={`navbar ${navbarClass}`}>
            <div className="container nav-container">
                <a href="/#home" className="logo">
                    <span className="logo-icon">
                        <Sparkles size={28} />
                    </span>
                    <span className="logo-text">Print-IN 3D Creations</span>
                </a>
                <div className="nav-links">
                    <a href="/#home" className="nav-link">Home</a>
                    <a href="/#products" className="nav-link">Shop</a>

                    <button className="cart-btn-nav" onClick={toggleCart}>
                        <ShoppingCart size={24} />
                        <span className="cart-badge">{cartCount}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;