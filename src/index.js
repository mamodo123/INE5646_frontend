// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa os estilos CSS globais da aplicação
import App from './App'; // Importa o componente principal da aplicação
import reportWebVitals from './reportWebVitals'; // Importa a função para relatar métricas de desempenho web
import { AuthProvider } from './context/AuthContext'; // Importa o Provedor de Autenticação

// Cria a raiz do React para renderização da aplicação.
// Isso é o ponto de entrada principal para a renderização da árvore de componentes React.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza o componente principal da aplicação dentro do modo estrito do React.
// O AuthProvider envolve o componente App, tornando o contexto de autenticação
// disponível para todos os componentes dentro da árvore da aplicação.
root.render(
  <React.StrictMode>
    {/* AuthProvider: Essencial para gerenciar o estado de autenticação em toda a aplicação.
        Todos os componentes que precisam acessar informações de autenticação (como se o usuário está logado)
        ou funções de login/logout devem ser filhos deste provedor. */}
    <AuthProvider>
      <App /> {/* O componente principal da sua aplicação */}
    </AuthProvider>
  </React.StrictMode>
);

// Função para medir e relatar o desempenho da aplicação web (Core Web Vitals).
// Útil para monitorar a experiência do usuário e otimizar o desempenho.
reportWebVitals();
