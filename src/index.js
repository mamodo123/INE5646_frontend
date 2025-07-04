// src/index.js (ou o arquivo de entrada principal do seu React)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // <--- IMPORTE AQUI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* <--- ENVOLVA SEU APP COM O PROVEDOR */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();