// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen/LoginScreen';
import RegisterScreen from './components/RegisterScreen/RegisterScreen';
import HomeScreen from './components/HomeScreen/HomeScreen';
import ProfileScreen from './components/ProfileScreen/ProfileScreen'; // <<< Importe a nova tela
import { useAuth } from './context/AuthContext';
import API from './api/axiosInstance';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>; // Ou um spinner de carregamento
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { logout } = useAuth();

  useEffect(() => {
    // Interceptador de requisições (opcional, mas boa prática para adicionar token)
    const requestInterceptor = API.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptador de respostas para lidar com tokens expirados/inválidos
    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Se o erro for 401 (Unauthorized) ou 403 (Forbidden) e não for uma tentativa de refresh
        // (No seu caso, 403 é para token inválido/expirado)
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
          originalRequest._retry = true; // Marca a requisição para evitar loops infinitos
          console.error('Erro 401/403: Token inválido ou expirado. Deslogando...');
          logout(); // Chama a função logout do seu AuthContext
          // O App.js, por meio do PrivateRoute, detecta a mudança em isAuthenticated e redireciona para /login
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

    // Limpa os interceptadores quando o componente é desmontado
    return () => {
      API.interceptors.request.eject(requestInterceptor);
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]); // Dependência em logout para garantir que o efeito seja re-executado se logout mudar

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <HomeScreen />
            </PrivateRoute>
          }
        />
        <Route // <<< NOVA ROTA PARA O PERFIL
          path="/profile"
          element={
            <PrivateRoute>
              <ProfileScreen />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} /> {/* Redireciona para login por padrão */}
      </Routes>
    </Router>
  );
}

export default App;