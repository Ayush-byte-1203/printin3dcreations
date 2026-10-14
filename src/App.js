import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductDetails from './components/ProductDetails';
import SubProductDetails from './components/SubProductDetails';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import AboutUs from './components/AboutUs';
import TermsAndConditions from './components/TermsAndConditions';
import ReturnPolicy from './components/ReturnPolicy';
import FAQ from './components/FAQ';
import SearchPage from './components/SearchPage';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import './index.css';

import { useLocation } from 'react-router-dom';
import Seo from './components/Seo';
import NotFound from './components/NotFound';
import SupportWidget from './components/SupportWidget';
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const AdminTopics = lazy(() => import('./components/Admin/AdminTopics'));
const AdminProducts = lazy(() => import('./components/Admin/AdminProducts'));
const AdminHeroSettings = lazy(() => import('./components/Admin/AdminHeroSettings'));

function AdminEntry({ unlock }) {
    const navigate = useNavigate();

    useEffect(() => {
        unlock(true);
        navigate('/admin', { replace: true });
    }, [unlock, navigate]);

    return null;
}

export function AppContent({ isCheckoutOpen, setIsCheckoutOpen }) {
    const [, setAdminEntryAllowed] = useState(false);
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className="App">
            <Seo />
            {!isAdmin && <Navbar />}
            {!isAdmin && <Cart setIsCheckoutOpen={setIsCheckoutOpen} />}
            <CheckoutModal 
                isOpen={isCheckoutOpen} 
                onClose={() => setIsCheckoutOpen(false)} 
            />
            <Suspense fallback={<div role="status">Loading...</div>}>
            <Routes>
                {/* Customer-facing Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/product/:topicId" element={<ProductDetails />} />
                <Route path="/product/:topicId/:productId" element={<SubProductDetails />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/faq" element={<FAQ standalone={true} />} />
                <Route path="/search" element={<SearchPage />} />

                {/* Velzon-themed Admin Control Studio Routes */}
                <Route path="/696969" element={<AdminEntry unlock={setAdminEntryAllowed} />} />
                <Route element={<Outlet />}>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="categories" element={<AdminTopics />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="hero-settings" element={<AdminHeroSettings />} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>

            {!isAdmin && <Footer />}
            {!isAdmin && <SupportWidget />}
        </div>
    );
}

function App() {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    return (
        <HelmetProvider>
            <Router>
                <ScrollToTop />
                <CartProvider>
                    <AppContent 
                        isCheckoutOpen={isCheckoutOpen} 
                        setIsCheckoutOpen={setIsCheckoutOpen} 
                    />
                </CartProvider>
            </Router>
        </HelmetProvider>
    );
}

export default App;
