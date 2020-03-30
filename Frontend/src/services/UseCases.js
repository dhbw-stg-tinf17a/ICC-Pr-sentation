import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

const functions = {
  getCommuteUseCase() {
    return api.get('travel-planning');
  },
  getTravelUseCase() {
    return api.get('travel-planning');
  },
};

export default functions;
