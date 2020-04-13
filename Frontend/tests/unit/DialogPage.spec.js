import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import mockAxios from 'axios';
import DialogPage from '@/views/DialogPage.vue';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);

const routes = [
  {
    path: '/dialog',
    name: 'dialog',
    component: DialogPage,
  },
];
const router = new VueRouter({
  mode: 'history',
  routes,
});

jest.mock('@/services/SpeechSynthesis');
jest.mock('vue-quick-chat/dist/vue-quick-chat.css', () => jest.fn());
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: {
      textToDisplay: 'Lunch Break from: 11:00 AM\nTo: 01:00 PM\n\nRestaurant:'
                    + ' Restaurant Capretto\nOn: Spreuergasse Street\nDistance: 828m',
      textToRead: 'Your have time for a Lunch Break from 11:00 AM to  01:00 PM. I'
                + ' recommend Restaurant Capretto on Spreuergasse Street.',
      displayRouteOnMap: null,
      displayPointOnMap: { longitude: 48.8046, latitude: 9.21602 },
      furtherAction: 'Do you want to know how to get to the restaurant?',
      nextLink: 'lunch-break/confirm',
    },
  })),
  create: () => mockAxios,
  defaults: {
    adapter: {},
  },
}));

function factory() {
  return mount(DialogPage, {
    localVue,
    router,
    stubs: {
      Chat: true,
    },
  });
}

describe('DialogPage.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', () => {
      const wrapper = factory();
      expect(wrapper).toMatchSnapshot();
    });

    it('Chat component is displayed', () => {
      const wrapper = factory();
      expect(wrapper.find('chat-stub').isVisible()).toBe(true);
    });
  });

  describe('methods work', () => {
    it('route name is transformed to function name', () => {
      const wrapper = factory();
      expect(wrapper.vm.transformRouteNameToFunctionName('morning-routine')).toEqual('morningRoutineUseCase');
    });

    it('route name is transformed to readable name', () => {
      const wrapper = factory();
      expect(wrapper.vm.transformRouteNameToReadableName('morning-routine')).toEqual('Morning Routine');
    });

    it('message submitted, if next action exists and if user says "yes"', () => {
      const wrapper = factory();
      wrapper.vm.nextLink = 'morning-routine/confirm';
      wrapper.vm.userConfirmed('New Message');
      expect(wrapper.vm.messages[wrapper.vm.messages.length - 1].content).toEqual('New Message');
    });

    it('morning routine use case function handles api response', async () => {
      const wrapper = factory();
      const stub = jest.spyOn(wrapper.vm, 'handleApiResponse');
      await wrapper.vm.morningRoutineUseCase();
      expect(stub).toHaveBeenCalled();
    });

    it('travel planning use case function handles api response', async () => {
      const wrapper = factory();
      const stub = jest.spyOn(wrapper.vm, 'handleApiResponse');
      await wrapper.vm.travelPlanningUseCase();
      expect(stub).toHaveBeenCalled();
    });

    it('lunch break use case function handles api response if position defined', async () => {
      const wrapper = factory();
      const stub = jest.spyOn(wrapper.vm, 'handleApiResponse');
      await wrapper.vm.lunchBreakUseCase({
        coords: { latitude: 48.83737483, longitude: 7.362738 },
      });
      expect(stub).toHaveBeenCalled();
    });

    it('lunch break use case function requests position if not defined', async () => {
      const wrapper = factory();
      const stub = jest.spyOn(wrapper.vm, 'getCoordinates');
      await wrapper.vm.lunchBreakUseCase();
      expect(stub).toHaveBeenCalled();
    });

    it('personal trainer use case function handles api response', async () => {
      const wrapper = factory();
      const stub = jest.spyOn(wrapper.vm, 'handleApiResponse');
      await wrapper.vm.personalTrainerUseCase();
      expect(stub).toHaveBeenCalled();
    });

    it('geolocation error message is shown if location can not be identified', () => {
      const wrapper = factory();
      wrapper.vm.geolocationError('ERROR');
      wrapper.vm.$nextTick(() => {
        expect(wrapper).toMatchSnapshot();
      });
    });

    it('api error is displayed properly', () => {
      const wrapper = factory();
      wrapper.vm.handleApiError({ response: { status: 500, statusText: 'Error' } });
      expect(wrapper).toMatchSnapshot();
    });

    it('user input is emitted onType', () => {
      const wrapper = factory();
      wrapper.vm.onType({ target: { innerText: 'Hello Gunter' } });
      expect(wrapper.emitted('update:user-input')[0]).toEqual(['Hello Gunter']);
    });
  });
});
