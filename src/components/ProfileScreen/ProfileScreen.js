// src/components/ProfileScreen/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import './ProfileScreen.css'; // Importa os estilos CSS para esta tela

// Componente da tela de perfil do usuário
const ProfileScreen = () => {
  // Estados para gerenciar os dados do perfil e as mensagens de feedback
  const [name, setName] = useState(''); // Nome do usuário
  const [oldPassword, setOldPassword] = useState(''); // Senha antiga para validação de mudança de senha
  const [newPassword, setNewPassword] = useState(''); // Nova senha
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Confirmação da nova senha
  const [error, setError] = useState(''); // Mensagens de erro
  const [successMessage, setSuccessMessage] = useState(''); // Mensagens de sucesso
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Indica se o perfil está sendo carregado

  // Hook para navegação entre rotas
  const navigate = useNavigate();

  // Efeito para carregar os dados do perfil do usuário ao montar o componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Faz uma requisição GET para obter os dados do perfil do usuário
        const response = await API.get('/profile');
        setName(response.data.user.name); // Define o nome do usuário no estado
      } catch (err) {
        console.error("Erro ao carregar perfil:", err.response ? err.response.data : err.message);
        setError("Não foi possível carregar os dados do perfil.");
      } finally {
        setIsLoadingProfile(false); // Finaliza o estado de carregamento
      }
    };
    fetchProfile();
  }, []); // Array de dependências vazio para executar apenas uma vez

  // Função para validar os dados do formulário antes do envio
  const validateForm = () => {
    setError(''); // Limpa erros anteriores
    setSuccessMessage(''); // Limpa mensagens de sucesso anteriores

    // Validação do campo de nome
    if (name && name.trim() === '') {
      setError('O nome não pode ser vazio.');
      return false;
    }

    // Validações para a nova senha, se ela for fornecida
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
    } else {
      // Se a nova senha NÃO foi fornecida, mas a senha antiga ou a confirmação foram,
      // indica que há um preenchimento inconsistente.
      if (oldPassword || confirmNewPassword) {
        setError('Preencha a nova senha ou deixe os campos de senha em branco para não alterar.');
        return false;
      }
    }

    // Verifica se alguma alteração foi realmente feita para evitar requisições vazias
    if (!name && !newPassword) {
      setError('Nenhuma alteração foi fornecida.');
      return false;
    }

    return true; // Formulário válido
  };

  // Função assíncrona para lidar com a atualização do perfil
  const handleUpdateProfile = async () => {
    setError(''); // Limpa erros anteriores
    setSuccessMessage(''); // Limpa mensagens de sucesso anteriores

    if (!validateForm()) {
      return; // Interrompe se a validação falhar
    }

    try {
      const updateData = {};
      // Adiciona o nome aos dados de atualização apenas se ele foi preenchido/modificado
      if (name) updateData.name = name;

      // Adiciona os dados de senha apenas se uma nova senha foi fornecida
      if (newPassword) {
        updateData.oldPassword = oldPassword;
        updateData.newPassword = newPassword;
      }

      // Se não há dados para atualizar, exibe um erro e não faz a requisição
      if (Object.keys(updateData).length === 0) {
        setError('Nenhuma alteração foi fornecida.');
        return;
      }

      // Envia a requisição PUT para a API para atualizar o perfil
      const response = await API.put('/profile', updateData);

      if (response.status === 200) {
        setSuccessMessage(response.data.message || 'Perfil atualizado com sucesso!');
        // Limpa os campos de senha após uma atualização bem-sucedida
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
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

  // Função para navegar de volta para a tela inicial (dashboard)
  const handleGoToHome = () => {
    navigate('/app');
  };

  // Renderiza uma mensagem de carregamento enquanto o perfil está sendo buscado
  if (isLoadingProfile) {
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
        {/* Exibe mensagens de erro ou sucesso */}
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {/* Campo para o nome completo */}
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
        {/* Campo para a senha antiga */}
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
        {/* Campo para a nova senha */}
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
        {/* Campo para confirmar a nova senha */}
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

        {/* Botão para atualizar o perfil */}
        <button className="register-button" onClick={handleUpdateProfile}>
          Atualizar Perfil
        </button>
        {/* Link para voltar à tela inicial */}
        <p className="login-link" onClick={handleGoToHome}>
          Voltar para <strong>Home</strong>
        </p>
      </div>
    </div>
  );
};

export default ProfileScreen;
