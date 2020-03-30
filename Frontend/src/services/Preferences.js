import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

const functions = {
  getPreferences() {
    return api.get('preferences');
  },
  updatePreferences(preferences) {
    return api.patch('preferences', preferences);
  },
};

export default functions;
