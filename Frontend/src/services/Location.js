import axios from 'axios';
import qs from 'querystring';

const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

const functions = {
  sendPosition(location) {
    return api.put('user/coordinates', qs.stringify(location));
  },
};

export default functions;
