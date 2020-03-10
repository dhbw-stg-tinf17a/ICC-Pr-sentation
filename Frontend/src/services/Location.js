import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

const functions = {
  sendPosition(location) {
    return api.post('location', location);
  },
};

export default functions;
