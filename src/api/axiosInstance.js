// src/api/axiosInstance.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://vps.ravi.sg.vms.ufsc.br/api', // Sua URL base da API
  headers: {
    'Content-Type': 'application/json',
  },
});

// AQUI ESTÁ A MUDANÇA ESSENCIAL:
// Interceptador de requisições: Adiciona o token JWT antes de cada requisição
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token'); // Pega o token do localStorage
    if (token) {
      // Se o token existe, adiciona ao cabeçalho Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Retorna a configuração da requisição modificada
  },
  (error) => {
    // Para erros que ocorrem antes da requisição ser enviada (ex: erro de rede)
    return Promise.reject(error);
  }
);

export default API;