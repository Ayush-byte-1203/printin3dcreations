import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return <main className="policy-page-premium"><div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h1>Page not found</h1>
        <p>This page or product is no longer available.</p>
        <Link to="/" className="btn-premium btn-primary-p">Explore the collection</Link>
    </div></main>;
}
