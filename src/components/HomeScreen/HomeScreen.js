// src/components/HomeScreen/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // <<< Importe useNavigate
import API from '../../api/axiosInstance';
import './HomeScreen.css';

const HomeScreen = () => {
  const { logout } = useAuth();
  const navigate = useNavigate(); // <<< Inicialize useNavigate
  const [protectedData, setProtectedData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await API.get('/protected');
        setProtectedData(response.data.message + ' ' + JSON.stringify(response.data.user));
      } catch (err) {
        console.error('Erro ao buscar dados protegidos:', err);
        setError('Não foi possível carregar dados protegidos. Sua sessão pode ter expirado.');
      } finally {
        setLoading(false);
      }
    };

    fetchProtectedData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToProfile = () => { // <<< NOVA FUNÇÃO PARA NAVEGAR PARA O PERFIL
    navigate('/profile');
  };

  if (loading) {
    return <div className="home-container">Carregando dados protegidos...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-box">
        <h2>Bem-vindo à Área Protegida!</h2>
        {error && <p className="error-message">{error}</p>}
        {protectedData && <p className="protected-data">{protectedData}</p>}
        <div className="home-buttons">
          <button className="home-button" onClick={handleGoToProfile}> {/* <<< NOVO BOTÃO */}
            Meu Perfil
          </button>
          <button className="home-button logout-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;