import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen/LoginScreen';
import RegisterScreen from './components/RegisterScreen/RegisterScreen';
import DashboardScreen from './components/DashboardScreen/DashboardScreen';
import ProfileScreen from './components/ProfileScreen/ProfileScreen';
import SharedChatsScreen from './components/SharedChatsScreen/SharedChatsScreen'; // Importa o novo componente de chats compartilhados
import { useAuth } from './context/AuthContext'; // Importa o hook de autenticação
import API from './api/axiosInstance'; // Importa a instância configurada do Axios

// Componente PrivateRoute para proteger rotas que exigem autenticação.
// Ele verifica o status de autenticação do usuário e redireciona se necessário.
const PrivateRoute = ({ children }) => {
  // Obtém o estado de autenticação (isAuthenticated) e o estado de carregamento (isLoading)
  // do contexto de autenticação (AuthContext).
  const { isAuthenticated, isLoading } = useAuth();

  // Se o status de autenticação ainda estiver sendo carregado, exibe uma mensagem de carregamento.
  // Isso evita que a tela pisque ou tente renderizar conteúdo protegido antes que o status seja conhecido.
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Se o usuário não estiver autenticado (isAuthenticated é falso),
  // ele é redirecionado para a rota de login.
  // O 'replace' na propriedade Navigate garante que a entrada atual no histórico do navegador
  // seja substituída pela rota de login, impedindo que o usuário volte para a página protegida
  // usando o botão "voltar" do navegador.
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente principal da aplicação
function App() {
  // Obtém o estado de autenticação, carregamento e a função de logout do contexto de autenticação.
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Efeito para configurar um interceptor de resposta do Axios.
  // Este interceptor lida com erros de autenticação (401 ou 403) automaticamente,
  // deslogando o usuário se o token for inválido ou expirado.
  useEffect(() => {
    const responseInterceptor = API.interceptors.response.use(
      (response) => response, // Se a resposta for bem-sucedida, apenas a retorna.
      async (error) => {
        const originalRequest = error.config; // Armazena a configuração da requisição original.

        // Verifica se o erro é 401 (Não Autorizado) ou 403 (Proibido)
        // e se a requisição ainda não foi retentada (para evitar loops infinitos).
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
          originalRequest._retry = true; // Marca a requisição como retentada.
          console.error('App.js Interceptor: Erro 401/403: Token inválido ou expirado. Deslogando...');
          logout(); // Chama a função de logout para limpar o token e desautenticar o usuário.
          return Promise.reject(error); // Rejeita a promessa para propagar o erro.
        }
        return Promise.reject(error); // Rejeita a promessa para outros tipos de erro.
      }
    );

    // Função de limpeza para remover o interceptor quando o componente é desmontado.
    return () => {
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]); // A dependência `logout` garante que o interceptor seja recriado se a função `logout` mudar (embora com useCallback, ela será estável).

  // Log de depuração para acompanhar o estado de autenticação e carregamento.
  console.log('App.js está renderizando. isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // Se o estado de autenticação ainda estiver carregando, exibe uma mensagem.
  if (isLoading) {
    return <div>Verificando sessão...</div>;
  }

  return (
    // Configura o roteamento da aplicação usando BrowserRouter.
    <Router>
      <div className="App">
        {/* Define as rotas da aplicação */}
        <Routes>
          {/* Rota para a tela de Login */}
          <Route
            path="/login"
            // Se já autenticado, redireciona para /app; caso contrário, exibe LoginScreen.
            element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginScreen />}
          />
          {/* Rota para a tela de Registro */}
          <Route
            path="/register"
            // Se já autenticado, redireciona para /app; caso contrário, exibe RegisterScreen.
            element={isAuthenticated ? <Navigate to="/app" replace /> : <RegisterScreen />}
          />
          {/* Rota protegida para o Dashboard */}
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <DashboardScreen />
              </PrivateRoute>
            }
          />
          {/* Rota protegida para a tela de Perfil */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileScreen />
              </PrivateRoute>
            }
          />
          {/* NOVA Rota protegida para a tela de Chats Compartilhados */}
          <Route
            path="/shared"
            element={
              <PrivateRoute>
                <SharedChatsScreen /> {/* Renderiza o novo componente aqui */}
              </PrivateRoute>
            }
          />
          <Route path="/slides" element={<Navigate to="/presentation/presentation.html" replace />} />
          {/* Rota curinga para qualquer caminho não correspondido.
              Redireciona para /app se autenticado, ou para /login caso contrário. */}
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
