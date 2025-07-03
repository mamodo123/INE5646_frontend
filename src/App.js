// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './login/LoginScreen';
import RegisterScreen from './register/RegisterScreen';
import './App.css'; // Mantenha seu CSS global se tiver

function App() {
  // Simulação de estado de autenticação (você o implementaria de forma mais robusta)
  // Por enquanto, vamos assumir que não está autenticado para ver as telas de login/registro
  const isAuthenticated = false; // Mude para true se quiser simular um usuário logado

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota para a tela de Login */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Rota para a tela de Registro */}
          <Route path="/register" element={<RegisterScreen />} />

          {/* Rota padrão: se não houver rota específica, redireciona para /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;