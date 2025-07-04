// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'; // Adicione useCallback
import { jwtDecode } from 'jwt-decode'; // <<< IMPORTANTE: Módulo para decodificar JWT

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mova a lógica de verificação para uma função separada e use useCallback
  // Isso garante que a função não seja recriada a cada renderização, otimizando useEffects
  const checkAuthStatus = useCallback(() => {
    setIsLoading(true); // Define como carregando antes de verificar o status
    const token = localStorage.getItem('jwt_token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decodifica o token JWT
        const currentTime = Date.now() / 1000; // Tempo atual em segundos Unix

        // Verifica se o token expirou (decodedToken.exp é o tempo de expiração em segundos Unix)
        if (decodedToken.exp > currentTime) {
          setIsAuthenticated(true); // Token é válido e não expirou
          console.log('Token JWT válido no frontend. Expira em:', new Date(decodedToken.exp * 1000));
        } else {
          // Token expirado
          console.log('Token JWT expirado no frontend. Realizando logout...');
          localStorage.removeItem('jwt_token'); // Remove o token expirado do armazenamento
          setIsAuthenticated(false); // Define o estado de autenticação como falso
          // Opcional: Você pode adicionar um alert() ou toast aqui para notificar o usuário
          // alert('Sua sessão expirou. Por favor, faça login novamente.');
        }
      } catch (error) {
        // Captura erros se o token for malformado ou inválido (não decodificável por jwt-decode)
        console.error('Erro ao decodificar ou validar o token JWT no frontend:', error);
        localStorage.removeItem('jwt_token'); // Remove o token inválido
        setIsAuthenticated(false); // Define o estado de autenticação como falso
        // alert('Token de sessão inválido. Por favor, faça login novamente.');
      }
    } else {
      // Não há token no localStorage
      setIsAuthenticated(false);
    }
    setIsLoading(false); // Finaliza o estado de carregamento após a verificação
  }, []); // As dependências vazias garantem que checkAuthStatus não muda a cada render, o que é bom para useEffect

  // O useEffect chamará checkAuthStatus apenas uma vez na montagem inicial do AuthProvider
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // `checkAuthStatus` é uma dependência porque é uma função definida fora

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
  };

  // Exponha checkAuthStatus no contexto caso você precise chamá-la manualmente em outro lugar (menos comum)
  const authContextValue = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus // Pode ser útil para verificar status em pontos específicos da UI
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};