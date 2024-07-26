// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { OrdersProvider } from './OrdersContext';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <OrdersProvider>
    <App />
  </OrdersProvider>,
  document.getElementById('root')
);
