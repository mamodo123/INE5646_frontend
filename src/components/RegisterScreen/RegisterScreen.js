// src/components/RegisterScreen/RegisterScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import './RegisterScreen.css';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const validateForm = () => {
    // Limpa mensagens de erro e sucesso anteriores antes de validar
    setError('');
    setSuccessMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido.');
      return false;
    }

    // --- NOVAS VALIDAÇÕES DE SENHA ---
    if (password.length < 8) { // Aumentei para 8 caracteres como boa prática
      setError('A senha deve ter pelo menos 8 caracteres.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra minúscula.');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError('A senha deve conter pelo menos um número.');
      return false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) { // Regex para caracteres especiais
      setError('A senha deve conter pelo menos um caractere especial.');
      return false;
    }
    // --- FIM DAS NOVAS VALIDAÇÕES DE SENHA ---

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }

    return true; // Se todas as validações passarem
  };

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      console.log('Dados para registro:', { name, email, password });
      const response = await API.post('/register', { name, email, password });

      if (response.status === 201) {
        setSuccessMessage(response.data.message || 'Registro realizado com sucesso! Você pode fazer login agora.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Ocorreu um erro inesperado ao registrar.');
      }
    } catch (err) {
      console.error('Erro no registro:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro ao tentar registrar. Verifique sua conexão ou tente novamente.');
      }
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
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
            placeholder="Mínimo 8 caracteres, com maiúscula, minúscula, número e especial"
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