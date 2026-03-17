import React, { useEffect } from 'react';
import Hero from './Hero';
import Products from './Products';
import Contact from './Contact';

const Home = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main>
            <Hero />
            <Products />
            <Contact />
        </main>
    );
};

export default Home;
