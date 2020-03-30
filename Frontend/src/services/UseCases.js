import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

const functions = {
  getMorningRoutineUseCase() {
    return api.get('travel-planning');
  },
  getTravelPlanningUseCase() {
    return api.get('travel-planning');
  },
};

export default functions;
