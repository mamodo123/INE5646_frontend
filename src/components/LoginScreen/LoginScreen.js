// src/components/LoginScreen/LoginScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError('');
    try {
      const response = await new Promise(resolve => {
        setTimeout(() => {
          if (email === 'user@example.com' && password === 'password123') {
            resolve({ success: true, token: 'fake_jwt_token_12345' });
          } else {
            resolve({ success: false, message: 'Email ou senha inválidos.' });
          }
        }, 1000);
      });

      if (response.success) {
        console.log('Login bem-sucedido!');
        login(response.token);
      } else {
        setError(response.message || 'Erro desconhecido ao fazer login.');
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
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