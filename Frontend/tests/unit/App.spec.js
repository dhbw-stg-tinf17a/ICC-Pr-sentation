import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import mockAxios from 'axios';
import SpeechService from '@/services/SpeechSynthesis';
import App from '@/App.vue';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'landingPage',
    component: App,
  },
  {
    path: '/dialog',
    name: 'dialog',
    component: App,
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: App,
  },
  {
    path: '/help',
    name: 'help',
    component: App,
  },
  {
    path: '/preferences',
    name: 'preferences',
    component: App,
  },
];
const router = new VueRouter({
  routes,
});

jest.mock('@/services/SpeechSynthesis');
jest.mock('axios', () => ({
  patch: jest.fn(() => Promise.resolve()),
  create: () => mockAxios,
  defaults: {
    adapter: {},
  },
}));

function factory() {
  return mount(App, {
    localVue,
    router,
    stubs: ['Navbar'],
  });
}


describe('App.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', () => {
      const wrapper = factory();
      expect(wrapper).toMatchSnapshot();
    });

    it('Navbar component renders', () => {
      const wrapper = factory();
      expect(wrapper.find('navbar-stub').isVisible()).toBe(true);
    });
  });

  describe('test SpeechRecognitionLogic.js mixin', () => {
    it('route change, when userInput equals keyword', () => {
      const keywords = ['personal-trainer', 'morning-routine', 'lunch-break', 'travel-planning'];
      const wrapper = factory();
      for (let i = 0; i < keywords.length; i += 1) {
        wrapper.vm.checkForTriggerWord(keywords[i]);
        expect(router.currentRoute.name).toBe('dialog');
      }
    });

    it('only one route change when keyword is entered twice', () => {
      const wrapper = factory();
      // mock refs to components that are not rendered
      wrapper.vm.$refs.routerView.submitMyMessage = jest.fn();
      wrapper.vm.$refs.routerView.personalTrainerUseCase = jest.fn();
      wrapper.vm.checkForTriggerWord('personal-trainer');
      wrapper.vm.checkForTriggerWord('personal-trainer');
      expect(router.currentRoute.query.usecase).toBe('personal-trainer');
    });

    it('help, preferences and calendar keywords are recognized', () => {
      const keywords = ['calendar', 'help', 'preferences'];
      const wrapper = factory();
      for (let i = 0; i < keywords.length; i += 1) {
        wrapper.vm.checkForTriggerWord(keywords[i]);
        expect(router.currentRoute.name).toBe(keywords[i]);
      }
    });

    it('time is read, when user inputs time keyword', () => {
      const wrapper = factory();
      wrapper.vm.checkForTriggerWord('time');
      expect(SpeechService.speak).toHaveBeenCalled();
    });

    it('userConfirmed is triggered if yes is recognized', () => {
      const wrapper = factory();
      // mock refs to components that are not rendered
      wrapper.vm.$refs.routerView.userConfirmed = jest.fn();
      wrapper.vm.checkForTriggerWord('yes');
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.userInput).toBe('');
      });
    });

    it('userInput watcher calls function', () => {
      const wrapper = factory();
      const spy = jest.spyOn(wrapper.vm, 'checkForTriggerWord');
      wrapper.vm.userInput = 'Test';
      wrapper.vm.$nextTick(() => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
