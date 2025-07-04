// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen/LoginScreen';
import RegisterScreen from './components/RegisterScreen/RegisterScreen';
import HomeScreen from './components/HomeScreen/HomeScreen';
import ProfileScreen from './components/ProfileScreen/ProfileScreen';
import { useAuth } from './context/AuthContext'; // Importe do CONTEXTO
import API from './api/axiosInstance';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth(); // Este aqui está correto

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />; // Adicione 'replace' aqui também
};

function App() {
  // AQUI ESTÁ A MUDANÇA: Obtenha isAuthenticated e isLoading do useAuth()
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // Interceptador de requisições (agora em axiosInstance.js, então pode ser removido daqui se duplicado)
    // Se você já colocou este interceptador em axiosInstance.js, remova-o daqui.
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

        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
          originalRequest._retry = true;
          console.error('Erro 401/403: Token inválido ou expirado. Deslogando...');
          logout();
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

    // Limpa os interceptadores quando o componente é desmontado
    return () => {
      API.interceptors.request.eject(requestInterceptor); // Remova se já está em axiosInstance.js
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // Adicione um log para depurar o valor de isAuthenticated no App.js
  console.log('App.js está renderizando. isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // AQUI ESTÁ A OUTRA MUDANÇA: Use isLoading para mostrar um estado de carregamento inicial
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
                <HomeScreen />
              </PrivateRoute>
            }
          />

          {/* Rota Protegida para /profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileScreen />
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