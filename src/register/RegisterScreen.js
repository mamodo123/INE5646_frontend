// src/components/RegisterScreen/RegisterScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import './RegisterScreen.css';

// Não precisamos mais das props onRegisterSuccess, onGoToLogin aqui
const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate(); // Inicialize o hook de navegação

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido.');
      return false;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    setError('');
    return true;
  };

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      console.log('Dados para registro:', { name, email, password });
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage('Registro realizado com sucesso! Você pode fazer login agora.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Após o registro bem-sucedido, navega para a tela de login
      setTimeout(() => { // Pequeno atraso para o usuário ver a mensagem de sucesso
        navigate('/login');
      }, 2000); // Navega após 2 segundos
      
    } catch (err) {
      setError('Erro ao registrar. Por favor, tente novamente.');
      console.error('Erro no registro:', err);
    }
  };

  const handleGoToLogin = () => {
    console.log('Botão Entrar clicado! Navegando para /login');
    navigate('/login'); // Usa navigate para ir para a rota de login
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Criar Conta</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="input-group">
          <label htmlFor="name">Nome Completo</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">Repetir Senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua senha"
          />
        </div>

        <button className="register-button" onClick={handleRegister}>
          Registrar
        </button>
        <p className="login-link" onClick={handleGoToLogin}>
          Já tem uma conta? **Entrar**
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;