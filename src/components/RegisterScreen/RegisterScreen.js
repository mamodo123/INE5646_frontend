// src/components/RegisterScreen/RegisterScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance'; // Importe sua instância de Axios
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
    // ... (sua lógica de validação de formulário existente)
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
      // Faz a requisição POST para a rota de registro do seu backend
      const response = await API.post('/register', { name, email, password });

      // Se a requisição foi bem-sucedida (o backend retorna 201 para registro)
      if (response.status === 201) {
        setSuccessMessage(response.data.message || 'Registro realizado com sucesso! Você pode fazer login agora.');
        // Limpa os campos após o sucesso
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redireciona para a tela de login após um pequeno atraso para o usuário ver a mensagem
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Ocorreu um erro inesperado ao registrar.');
      }
    } catch (err) {
      // Captura erros de requisição (por exemplo, status 400 se o email já existe)
      console.error('Erro no registro:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Exibe a mensagem de erro do backend
      } else {
        setError('Ocorreu um erro ao tentar registrar. Tente novamente.');
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