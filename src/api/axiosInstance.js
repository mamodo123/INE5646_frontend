// src/api/axiosInstance.js
import axios from 'axios';

// Define a URL base da API conforme o ambiente de execução.
// Em desenvolvimento, usa um endpoint local. Em produção, carrega a URL de uma variável de ambiente.
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_BASE_URL
    : 'http://localhost:5000/api';

// Cria uma instância do Axios com a URL base e o tipo de conteúdo padrão.
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um interceptor para incluir o token JWT em todas as requisições.
// Isso garante que o usuário esteja autenticado automaticamente.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Rejeita a promessa em caso de erro na requisição.
    return Promise.reject(error);
  }
);

export default API;