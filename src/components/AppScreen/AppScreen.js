// src/components/AppScreen/AppScreen.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const AppScreen = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    alert('Você foi desconectado!');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#e6ffe6',
      color: '#333',
      fontSize: '24px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <h1>Bem-vindo à Área Protegida!</h1>
      <p>Este é um conteúdo que só aparece se você estiver autenticado.</p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '18px'
        }}
      >
        Sair (Logout)
      </button>
    </div>
  );
};

export default AppScreen;