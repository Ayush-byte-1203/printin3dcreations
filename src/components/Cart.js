import React from 'react';
import { useCart } from '../context/CartContext';
import './CSS/Cart.css';

const Cart = () => {
    const {
        cartItems,
        isCartOpen,
        toggleCart,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useCart();

    const handleCheckout = () => {
        const phoneNumber = "917043591952"; // Updated to business number

        // Build the message
        let message = `*New Order Request*\n\n`;
        message += `Hello Print-IN, I'd like to place an order for:\n\n`;

        cartItems.forEach(item => {
            message += `🔹 [${item.id}] ${item.title} (x${item.quantity}) - ₹${item.price * item.quantity}\n`;
        });

        message += `\n*Total Amount: ₹${cartTotal}*`;
        message += `\n\nPlease confirm my order.`;

        const encodedText = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

        window.open(whatsappUrl, '_blank');
    };

    if (!isCartOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={toggleCart}></div>
            <div className="cart-panel glass-panel">
                <div className="cart-header">
                    <h2>Your Cart</h2>
                    <button className="close-cart-btn" onClick={toggleCart}>×</button>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <span className="empty-emoji">🛒</span>
                            <p>Your cart is empty.</p>
                            <button className="btn btn-outline" onClick={toggleCart}>Start Shopping</button>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-image">
                                    {item.image}
                                </div>
                                <div className="cart-item-details">
                                    <h3>{item.title}</h3>
                                    <p className="item-price">₹{item.price}</p>
                                    <div className="quantity-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                </div>
                                <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>×</button>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span className="total-amount">₹{cartTotal}</span>
                        </div>
                        <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
                            Order on WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
