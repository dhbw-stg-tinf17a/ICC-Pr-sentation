import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

const functions = {
  sendPosition(location) {
    return api.put('user/coordinates', location);
  },
};

export default functions;
