import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
});

const functions = {
  getMorningRoutineUseCase() {
    return api.get('morning-routine');
  },
  getTravelPlanningUseCase() {
    return api.get('travel-planning');
  },
  getPersonalTrainerUseCase() {
    return api.get('personal-trainer');
  },
  getLunchBreakUseCase() {
    return api.get('lunch-break');
  },
  getFurtherInformation(route) {
    return api.get(route);
  },
};

export default functions;
