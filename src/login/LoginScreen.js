// src/components/LoginScreen/LoginScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import './LoginScreen.css';

// Não precisamos mais das props onGoToRegister aqui
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Inicialize o hook de navegação

  const handleLogin = async () => {
    setError('');

    // Simulação da função de autenticação (mantenha sua lógica aqui)
    const success = await new Promise(resolve => {
      setTimeout(() => {
        if (email === 'erro@teste.com' || password === 'senhaerrada') {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 500);
    });

    if (success) {
      console.log('Login bem-sucedido!');
      alert('Login realizado com sucesso!');
      // TODO: Redirecionar para a página principal (ex: '/dashboard')
      navigate('/dashboard'); // Exemplo: navega para uma rota de dashboard
    } else {
      console.log('Erro ao tentar fazer login.');
      setError('Email ou senha inválidos. Por favor, tente novamente.');
    }
  };

  const handleRegister = () => {
    console.log('Botão Registrar clicado! Navegando para /register');
    navigate('/register'); // Usa navigate para ir para a rota de registro
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