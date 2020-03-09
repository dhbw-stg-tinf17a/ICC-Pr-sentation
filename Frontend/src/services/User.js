import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gunter.felixsz.de/api/',
});

const functions = {
  getUser() {
    return api.get('user');
  },
};

export default functions;
