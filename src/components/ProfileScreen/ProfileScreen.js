// src/components/ProfileScreen/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import './ProfileScreen.css'; // Reutilizando ou criando um novo CSS

const ProfileScreen = () => {
  const { logout } = useAuth();
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Novo estado para carregamento do perfil
  const navigate = useNavigate();

  // NOVO: useEffect para carregar o nome do usuário ao montar a tela
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/profile'); // Requisição GET para o backend
        setName(response.data.user.name); // Define o nome no estado
        setIsLoadingProfile(false); // Finaliza o carregamento
      } catch (err) {
        console.error("Erro ao carregar perfil:", err.response ? err.response.data : err.message);
        setError("Não foi possível carregar os dados do perfil.");
        setIsLoadingProfile(false);
        // Se for erro de autenticação (401/403), o interceptador do Axios já vai deslogar
      }
    };
    fetchProfile();
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  const validateForm = () => {
    setError('');
    setSuccessMessage('');

    // Validação de nome (agora verifica se foi alterado e se não está vazio)
    // Se o usuário não alterou o nome, mas alterou a senha, setName('');
    // ao carregar os dados não vai resetar o nome original.
    // É importante que o backend aceite name nulo para não alterar.
    if (name && name.trim() === '') {
      setError('O nome não pode ser vazio.');
      return false;
    }

    // Validações de senha (apenas se nova senha for fornecida)
    if (newPassword) {
      if (newPassword.length < 8) {
        setError('A nova senha deve ter pelo menos 8 caracteres.');
        return false;
      }
      if (!/[A-Z]/.test(newPassword)) {
        setError('A nova senha deve conter pelo menos uma letra maiúscula.');
        return false;
      }
      if (!/[a-z]/.test(newPassword)) {
        setError('A nova senha deve conter pelo menos uma letra minúscula.');
        return false;
      }
      if (!/[0-9]/.test(newPassword)) {
        setError('A nova senha deve conter pelo menos um número.');
        return false;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword)) {
        setError('A nova senha deve conter pelo menos um caractere especial.');
        return false;
      }
      if (newPassword !== confirmNewPassword) {
        setError('A nova senha e a confirmação não coincidem.');
        return false;
      }
      if (!oldPassword) {
        setError('Para alterar a senha, a senha antiga é obrigatória.');
        return false;
      }
    } else { // Se newPassword NÃO foi fornecida, mas oldPassword ou confirmNewPassword foram
        if (oldPassword || confirmNewPassword) {
            setError('Preencha a nova senha ou deixe os campos de senha em branco para não alterar.');
            return false;
        }
    }


    // Verifica se alguma alteração real foi feita ou se os campos de nome/senha não foram mexidos
    // Apenas envie a requisição se houver algo para atualizar
    if (!name && !newPassword) { // Se nem nome nem nova senha foram preenchidos
        setError('Nenhuma alteração foi fornecida.');
        return false;
    }

    return true;
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {};
      if (name) updateData.name = name; // Envia o nome apenas se o campo foi preenchido/alterado
      
      // Só adiciona os dados de senha se uma nova senha foi fornecida
      if (newPassword) { 
        updateData.oldPassword = oldPassword;
        updateData.newPassword = newPassword;
      }

      // Se nenhum dado para atualização foi coletado (ex: nome veio vazio e nova senha vazia), não faça a requisição
      if (Object.keys(updateData).length === 0) {
        setError('Nenhuma alteração foi fornecida.');
        return; // Não envia a requisição se não há nada para atualizar
      }

      const response = await API.put('/profile', updateData);

      if (response.status === 200) {
        setSuccessMessage(response.data.message || 'Perfil atualizado com sucesso!');
        // Limpar campos de senha após sucesso
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        // Opcional: Limpar campo de nome se ele foi atualizado para o novo nome digitado
        // setName(''); // Não, o nome já está no estado, não precisa limpar
      } else {
        setError('Ocorreu um erro inesperado ao atualizar o perfil.');
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro ao tentar atualizar o perfil. Verifique sua conexão ou tente novamente.');
      }
    }
  };

  const handleGoToHome = () => {
    navigate('/app');
  };

  if (isLoadingProfile) { // Mostra um carregamento enquanto busca o nome
    return (
      <div className="register-container">
        <div className="register-box">
          <h2>Carregando Perfil...</h2>
          <p>Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Atualizar Perfil</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="input-group">
          <label htmlFor="name">Nome Completo</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome atual"
          />
        </div>
        <div className="input-group">
          <label htmlFor="oldPassword">Senha Antiga</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Obrigatório para trocar a senha"
          />
        </div>
        <div className="input-group">
          <label htmlFor="newPassword">Nova Senha</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres, com maiúscula, minúscula, número e especial"
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirmNewPassword">Repetir Nova Senha</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirme sua nova senha"
          />
        </div>

        <button className="register-button" onClick={handleUpdateProfile}>
          Atualizar Perfil
        </button>
        <p className="login-link" onClick={handleGoToHome}>
          Voltar para **Home**
        </p>
      </div>
    </div>
  );
};

export default ProfileScreen;