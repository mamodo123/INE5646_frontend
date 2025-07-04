// src/api/axiosInstance.js
import axios from 'axios';

// Define a URL base da API com base no ambiente
// No ambiente de desenvolvimento (npm start), process.env.NODE_ENV é 'development'
// No ambiente de produção (npm run build), process.env.NODE_ENV é 'production'
// A variável REACT_APP_API_BASE_URL é lida do .env.production durante o build de produção.
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_BASE_URL
    : 'http://localhost:5000/api'; // URL para desenvolvimento

const API = axios.create({
  baseURL: API_BASE_URL, // Usa a URL base definida acima
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de requisições: Adiciona o token JWT antes de cada requisição
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;