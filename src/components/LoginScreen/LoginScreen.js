// src/components/LoginScreen/LoginScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosInstance'; // Importa a instância configurada do Axios
import './LoginScreen.css';

// Componente da tela de login
const LoginScreen = () => {
  // Estados para armazenar os valores dos campos de email e senha, e mensagens de erro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Hooks para navegação e acesso ao contexto de autenticação
  const navigate = useNavigate();
  const { login } = useAuth();

  // Função assíncrona para lidar com o processo de login
  const handleLogin = async () => {
    setError(''); // Limpa qualquer mensagem de erro anterior

    try {
      // Envia uma requisição POST para a API de login com as credenciais do usuário
      const response = await API.post('/login', { email, password });

      // Verifica se a requisição foi bem-sucedida (status 200)
      if (response.status === 200) {
        // Chama a função de login do contexto de autenticação, passando o token JWT recebido
        login(response.data.token);
        // A navegação para a rota protegida será gerenciada pelo componente App.js
      }
    } catch (err) {
      // Captura e trata erros da requisição (ex: credenciais inválidas, erro de servidor)
      console.error('Erro na autenticação:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        // Exibe a mensagem de erro fornecida pelo backend
        setError(err.response.data.message);
      } else {
        // Exibe uma mensagem de erro genérica em caso de falha de conexão ou erro inesperado
        setError('Ocorreu um erro ao tentar fazer login. Verifique sua conexão ou tente novamente.');
      }
    }
  };

  // Função para navegar para a tela de registro
  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {/* Campo de input para o email */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
          />
        </div>
        {/* Campo de input para a senha */}
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />
        </div>

        {/* Exibe a mensagem de erro, se houver */}
        {error && <p className="error-message">{error}</p>}

        {/* Botão para realizar o login */}
        <button className="login-button" onClick={handleLogin}>
          Entrar
        </button>
        {/* Link para a tela de registro */}
        <p className="register-link" onClick={handleRegister}>
          Não tem uma conta? <strong>Registrar</strong>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
