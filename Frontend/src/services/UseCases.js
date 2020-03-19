import axios from 'axios';

const api = axios.create({
  baseURL: '/api/usecases/',
});

const functions = {
  getCommuteUseCase() {
    return api.get('1');
  },
};

export default functions;
