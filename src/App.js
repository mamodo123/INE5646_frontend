// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen/LoginScreen';
import RegisterScreen from './components/RegisterScreen/RegisterScreen';
import AppScreen from './components/AppScreen/AppScreen';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './components/context/AuthContext';

import './App.css'; // Seu CSS global, se houver

function App() {
  // CHAME O HOOK useAuth AQUI NO COMPONENTE PAI
  const { isAuthenticated, isLoading } = useAuth();

  // Mostra um carregamento inicial enquanto o status de autenticação é verificado
  if (isLoading) {
    return <div>Verificando sessão...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota para o Login: se já autenticado, redireciona para /app */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginScreen />}
          />

          {/* Rota para o Registro: se já autenticado, redireciona para /app */}
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/app" replace /> : <RegisterScreen />}
          />

          {/* Rota Protegida: Apenas acessível se autenticado */}
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <AppScreen />
              </PrivateRoute>
            }
          />

          {/* Rota Padrão (Catch-all): Se nenhuma rota corresponder */}
          {/* Redireciona para /app se autenticado, caso contrário para /login */}
          <Route
            path="*"
            element={isAuthenticated ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;