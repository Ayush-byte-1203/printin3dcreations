import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DataProvider } from './context/DataContext';
import reportWebVitals from './reportWebVitals';

const element = document.getElementById('root');
const bootstrap = document.getElementById('catalog-data');
let initialData = null;
try { initialData = bootstrap ? JSON.parse(bootstrap.textContent) : null; } catch { /* Refresh from API. */ }
const app = <React.StrictMode><DataProvider initialData={initialData}><App /></DataProvider></React.StrictMode>;
if (element.hasChildNodes()) ReactDOM.hydrateRoot(element, app);
else ReactDOM.createRoot(element).render(app);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
