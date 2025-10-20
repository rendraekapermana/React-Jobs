// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- Impor

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* <-- Bungkus App */}
      <App />
    </AuthProvider>
  </StrictMode>
);