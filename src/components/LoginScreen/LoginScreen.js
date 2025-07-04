// src/components/LoginScreen/LoginScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosInstance'; // Importe sua instância de Axios
import './LoginScreen.css';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(''); // Limpa erros anteriores

    try {
      // Faz a requisição POST para a rota de login do seu backend
      const response = await API.post('/login', { email, password });

      // Se a requisição foi bem-sucedida (status 200, 201, etc.)
      if (response.status === 200) { // O backend retorna 200 para sucesso no login
        console.log('Login bem-sucedido!', response.data);
        // O token JWT vem na propriedade 'token' da resposta do backend
        login(response.data.token); // Chama a função login do contexto com o token recebido
        // O redirecionamento para /app será tratado pelo App.js (rotas)
      } else {
        // Isso geralmente não será atingido se o backend retornar um status de erro (400, 401),
        // pois o 'catch' abaixo ou o interceptador de Axios lidarão com isso.
        setError('Ocorreu um erro inesperado ao fazer login.');
      }
    } catch (err) {
      // Captura erros de requisição (por exemplo, status 400, 401, 500)
      console.error('Erro na autenticação:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Exibe a mensagem de erro do backend
      } else {
        setError('Ocorreu um erro ao tentar fazer login. Verifique sua conexão ou tente novamente.');
      }
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
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

        {error && <p className="error-message">{error}</p>}

        <button className="login-button" onClick={handleLogin}>
          Entrar
        </button>
        <p className="register-link" onClick={handleRegister}>
          Não tem uma conta? **Registrar**
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;