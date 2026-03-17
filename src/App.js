import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductDetails from './components/ProductDetails';
import SubProductDetails from './components/SubProductDetails';
import Cart from './components/Cart';

import Contact from './components/Contact';
import { CartProvider } from './context/CartContext';
import './index.css';

function App() {

  return (
    <Router>
      <CartProvider>
        <div className="App">
          <Navbar />
          <Cart />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/product/:topicId/:productId" element={<SubProductDetails />} />
            <Route path="/contact" element={<div style={{ paddingTop: '100px' }}><Contact /></div>} />
          </Routes>

          <footer style={{ padding: '80px 0', textAlign: 'center', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', marginTop: '100px', borderTop: '1px solid var(--color-glass-border)' }}>
            <div className="container">
              <p>© 2023 Print-IN 3D Creations. All Rights Reserved.</p>
            </div>
          </footer>
        </div>
      </CartProvider>
    </Router >
  );
}

export default App;
