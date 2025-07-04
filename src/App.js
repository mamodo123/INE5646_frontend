// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen/LoginScreen';
import RegisterScreen from './components/RegisterScreen/RegisterScreen';
// import HomeScreen from './components/HomeScreen/HomeScreen'; // Remova se não for mais usar
import DashboardScreen from './components/DashboardScreen/DashboardScreen'; // <<< Importe o DashboardScreen
import ProfileScreen from './components/ProfileScreen/ProfileScreen';
import { useAuth } from './context/AuthContext';
import API from './api/axiosInstance';

// PrivateRoute (mantida aqui ou em seu próprio arquivo PrivateRoute.js)
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // Interceptador de requisições (no axiosInstance.js agora)
    // Interceptador de respostas
    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
          originalRequest._retry = true;
          console.error('Erro 401/403: Token inválido ou expirado. Deslogando...');
          logout();
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  console.log('App.js está renderizando. isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return <div>Verificando sessão...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginScreen />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/app" replace /> : <RegisterScreen />}
          />
          {/* Rota Protegida: Agora renderiza DashboardScreen */}
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <DashboardScreen /> {/* <<< Renderiza o DashboardScreen */}
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileScreen />
              </PrivateRoute>
            }
          />
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