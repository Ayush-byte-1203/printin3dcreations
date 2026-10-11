import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { purgeLegacyTokens } from './adminApi';
purgeLegacyTokens();
import { DataProvider } from './context/DataContext';

const element = document.getElementById('root');
const bootstrap = document.getElementById('catalog-data');
let initialData = null;
try { initialData = bootstrap ? JSON.parse(bootstrap.textContent) : null; } catch { /* Refresh from API. */ }
const app = <React.StrictMode><DataProvider initialData={initialData}><App /></DataProvider></React.StrictMode>;
if (element.hasChildNodes()) ReactDOM.hydrateRoot(element, app);
else ReactDOM.createRoot(element).render(app);
