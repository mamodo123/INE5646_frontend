// src/api/axiosInstance.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://vps.ravi.sg.vms.ufsc.br/api', // <--- Certifique-se que esta URL está correta
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;