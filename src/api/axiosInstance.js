// src/api/axiosInstance.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // <--- Certifique-se que esta URL está correta
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;