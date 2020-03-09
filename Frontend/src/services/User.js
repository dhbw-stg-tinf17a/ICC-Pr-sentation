import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

const functions = {
  getUser() {
    return api.get('user');
  },
};

export default functions;
