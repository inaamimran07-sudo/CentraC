import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { AuthProvider } from './context/AuthContext';
import App from './App';

// Configure axios to use the backend API
axios.defaults.baseURL = 'http://localhost:5000';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
