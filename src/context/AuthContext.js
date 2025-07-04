// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // IMPORTANTE: Módulo para decodificar JWT

// Cria o contexto de autenticação, inicializado como nulo.
// Este contexto será usado para compartilhar o estado de autenticação em toda a árvore de componentes.
const AuthContext = createContext(null);

// Provedor de Autenticação que encapsula a lógica de estado e funções de autenticação.
// Ele disponibiliza o estado de autenticação e as funções de login/logout para os componentes filhos.
export const AuthProvider = ({ children }) => {
  // Estado para indicar se o usuário está autenticado.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para indicar se o processo de verificação de autenticação está em andamento.
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar o status de autenticação, memorizada com useCallback.
  // Isso otimiza o desempenho, evitando que a função seja recriada em cada renderização.
  const checkAuthStatus = useCallback(() => {
    setIsLoading(true); // Inicia o estado de carregamento antes da verificação.
    const token = localStorage.getItem('jwt_token'); // Tenta obter o token JWT do armazenamento local.

    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decodifica o token para acessar seus dados (ex: tempo de expiração).
        const currentTime = Date.now() / 1000; // Obtém o tempo atual em segundos Unix.

        // Verifica se o token não expirou comparando o tempo de expiração (exp) com o tempo atual.
        if (decodedToken.exp > currentTime) {
          setIsAuthenticated(true); // Define o usuário como autenticado.
          console.log('Token JWT válido no frontend. Expira em:', new Date(decodedToken.exp * 1000));
        } else {
          // Se o token expirou, remove-o do armazenamento e define o estado de autenticação como falso.
          console.log('Token JWT expirado no frontend. Realizando logout...');
          localStorage.removeItem('jwt_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Captura erros se o token for inválido ou malformado (não decodificável).
        console.error('Erro ao decodificar ou validar o token JWT no frontend:', error);
        localStorage.removeItem('jwt_token'); // Remove o token inválido.
        setIsAuthenticated(false); // Define o estado de autenticação como falso.
      }
    } else {
      // Se não houver token no localStorage, o usuário não está autenticado.
      setIsAuthenticated(false);
    }
    setIsLoading(false); // Finaliza o estado de carregamento após a verificação.
  }, []); // As dependências vazias garantem que `checkAuthStatus` não mude, o que é crucial para `useEffect`.

  // Efeito que chama `checkAuthStatus` uma vez na montagem inicial do `AuthProvider`.
  // Ele garante que o status de autenticação seja verificado assim que a aplicação carrega.
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // `checkAuthStatus` é uma dependência porque é uma função estável criada com `useCallback`.

  // Função para realizar o login do usuário.
  // Armazena o token JWT no armazenamento local e atualiza o estado de autenticação.
  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    setIsAuthenticated(true);
  };

  // Função para realizar o logout do usuário.
  // Remove o token JWT do armazenamento local e atualiza o estado de autenticação.
  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
  };

  // Objeto de valor do contexto que será disponibilizado para os consumidores.
  // Inclui o estado de autenticação, o estado de carregamento e as funções de login/logout.
  const authContextValue = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus // Exposto para casos onde uma re-verificação manual é necessária.
  };

  return (
    // O provedor do contexto envolve os componentes filhos, tornando o `authContextValue` acessível a eles.
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado `useAuth` para consumir o contexto de autenticação.
// Facilita o acesso aos valores do contexto em qualquer componente funcional.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Garante que `useAuth` seja usado dentro de um `AuthProvider`.
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
