// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Componente PrivateRoute para proteger rotas que exigem autenticação.
// Ele verifica o status de autenticação do usuário e redireciona se necessário.
const PrivateRoute = ({ children }) => {
  // Obtém o estado de autenticação (isAuthenticated) e o estado de carregamento (isLoading)
  // do contexto de autenticação (AuthContext).
  const { isAuthenticated, isLoading } = useAuth();

  // Se o status de autenticação ainda estiver sendo carregado, exibe uma mensagem de carregamento.
  // Isso evita que a tela pisque ou tente renderizar conteúdo protegido antes que o status seja conhecido.
  if (isLoading) {
    return <div>Carregando autenticação...</div>;
  }

  // Se o usuário não estiver autenticado (isAuthenticated é falso),
  // ele é redirecionado para a rota de login.
  // O 'replace' na propriedade Navigate garante que a entrada atual no histórico do navegador
  // seja substituída pela rota de login, impedindo que o usuário volte para a página protegida
  // usando o botão "voltar" do navegador.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado e o carregamento for concluído,
  // os componentes filhos (o conteúdo da rota protegida) são renderizados.
  return children;
};

export default PrivateRoute;
