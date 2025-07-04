// src/components/ProfileScreen/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext'; // Para pegar o token e o logout
import './ProfileScreen.css'; // Você pode reutilizar ou criar um novo CSS

const ProfileScreen = () => {
  const { logout } = useAuth(); // Pegar a função logout do contexto
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Opcional: Carregar o nome atual do usuário ao montar a tela
  // Isso requer uma rota no backend para "pegar" o perfil do usuário logado.
  // Por simplicidade, não vou adicionar essa rota agora, mas é uma boa prática.
  // Por enquanto, o campo nome virá vazio e o usuário pode preencher para atualizar.
  // Se quiser carregar o nome, você precisaria de:
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const response = await API.get('/profile'); // Rota GET /api/profile no backend
  //       setName(response.data.user.name);
  //     } catch (err) {
  //       console.error("Erro ao carregar perfil:", err);
  //       setError("Não foi possível carregar os dados do perfil.");
  //     }
  //   };
  //   fetchProfile();
  // }, []);


  const validateForm = () => {
    setError('');
    setSuccessMessage('');

    // Validação de nome (se for alterado)
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
    }

    // Se nenhuma alteração de nome ou senha foi tentada, ou se tudo validou
    if (!name && !oldPassword && !newPassword && !confirmNewPassword) {
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
      if (name) updateData.name = name;
      if (newPassword) {
        updateData.oldPassword = oldPassword;
        updateData.newPassword = newPassword;
        updateData.confirmNewPassword = confirmNewPassword; // Backend não usa, mas bom para enviar
      }

      const response = await API.put('/profile', updateData);

      if (response.status === 200) {
        setSuccessMessage(response.data.message || 'Perfil atualizado com sucesso!');
        // Limpar campos de senha após sucesso
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        // Opcional: Limpar campo de nome se ele foi atualizado
        // setName('');
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
      // Se o token expirou durante a requisição, o interceptor do Axios já deve deslogar.
    }
  };

  const handleGoToHome = () => {
    navigate('/app'); // Ou para onde for sua tela principal
  };

  return (
    <div className="register-container"> {/* Reutilizando o CSS do registro */}
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
            placeholder="Deixe em branco para não alterar"
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