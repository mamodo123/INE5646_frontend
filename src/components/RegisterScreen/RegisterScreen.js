// src/components/RegisterScreen/RegisterScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance'; // Importa a instância configurada do Axios
import './RegisterScreen.css'; // Importa os estilos CSS para esta tela

// Componente da tela de registro de usuário
const RegisterScreen = () => {
  // Estados para armazenar os valores dos campos do formulário e mensagens de feedback
  const [name, setName] = useState(''); // Nome completo do usuário
  const [email, setEmail] = useState(''); // Email do usuário
  const [password, setPassword] = useState(''); // Senha do usuário
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmação da senha
  const [error, setError] = useState(''); // Mensagens de erro
  const [successMessage, setSuccessMessage] = useState(''); // Mensagens de sucesso

  // Hook para navegação entre rotas
  const navigate = useNavigate();

  // Função para validar os dados do formulário antes do envio
  const validateForm = () => {
    // Limpa mensagens de erro e sucesso anteriores
    setError('');
    setSuccessMessage('');

    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!name || !email || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios.');
      return false;
    }
    // Valida o formato do email usando uma expressão regular simples
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido.');
      return false;
    }

    // Validações de segurança da senha
    if (password.length < 8) { // Verifica o comprimento mínimo da senha
      setError('A senha deve ter pelo menos 8 caracteres.');
      return false;
    }
    if (!/[A-Z]/.test(password)) { // Verifica se contém pelo menos uma letra maiúscula
      setError('A senha deve conter pelo menos uma letra maiúscula.');
      return false;
    }
    if (!/[a-z]/.test(password)) { // Verifica se contém pelo menos uma letra minúscula
      setError('A senha deve conter pelo menos uma letra minúscula.');
      return false;
    }
    if (!/[0-9]/.test(password)) { // Verifica se contém pelo menos um número
      setError('A senha deve conter pelo menos um número.');
      return false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) { // Verifica se contém pelo menos um caractere especial
      setError('A senha deve conter pelo menos um caractere especial.');
      return false;
    }

    // Verifica se a senha e a confirmação da senha coincidem
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }

    return true; // Retorna true se todas as validações passarem
  };

  // Função assíncrona para lidar com o processo de registro
  const handleRegister = async () => {
    setError(''); // Limpa erros anteriores
    setSuccessMessage(''); // Limpa mensagens de sucesso anteriores

    // Executa a validação do formulário; se falhar, interrompe a função
    if (!validateForm()) {
      return;
    }

    try {
      // Envia uma requisição POST para a API de registro com os dados do usuário
      const response = await API.post('/register', { name, email, password });

      // Verifica se a requisição foi bem-sucedida (status 201 - Created)
      if (response.status === 201) {
        setSuccessMessage(response.data.message || 'Registro realizado com sucesso! Você pode fazer login agora.');
        // Limpa os campos do formulário após o registro bem-sucedido
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redireciona para a tela de login após um pequeno atraso
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Em caso de status diferente de 201, exibe um erro genérico
        setError('Ocorreu um erro inesperado ao registrar.');
      }
    } catch (err) {
      // Captura e trata erros da requisição (ex: email já cadastrado, erro de servidor)
      console.error('Erro no registro:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        // Exibe a mensagem de erro fornecida pelo backend
        setError(err.response.data.message);
      } else {
        // Exibe uma mensagem de erro genérica em caso de falha de conexão ou erro inesperado
        setError('Ocorreu um erro ao tentar registrar. Verifique sua conexão ou tente novamente.');
      }
    }
  };

  // Função para navegar para a tela de login
  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Criar Conta</h2>
        {/* Exibe a mensagem de erro, se houver */}
        {error && <p className="error-message">{error}</p>}
        {/* Exibe a mensagem de sucesso, se houver */}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {/* Campo de input para o nome completo */}
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
        {/* Campo de input para o email */}
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
        {/* Campo de input para a senha */}
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
        {/* Campo de input para confirmar a senha */}
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

        {/* Botão para realizar o registro */}
        <button className="register-button" onClick={handleRegister}>
          Registrar
        </button>
        {/* Link para a tela de login */}
        <p className="login-link" onClick={handleGoToLogin}>
          Já tem uma conta? <strong>Entrar</strong>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;
