// init
import './lib/constants';
import './lib/http';
import './styles/global.scss';

// app
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Store } from './lib/store/internals';

// Initialise all the stores.
Store.initialize();


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);