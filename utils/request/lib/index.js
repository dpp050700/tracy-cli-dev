const axios = require('axios');

const BASE_URL = 'http://localhost:7001';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    }
    return null;
  },
  (error) => {
    Promise.reject(error);
  },
);

module.exports = request;
