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
    path: '/trainer',
    name: 'trainer',
    component: App,
  },
  {
    path: '/restaurant',
    name: 'restaurant',
    component: App,
  },
  {
    path: '/commute',
    name: 'commute',
    component: App,
  },
  {
    path: '/travel',
    name: 'travel',
    component: App,
  },
];
const router = new VueRouter({
  routes,
});

jest.mock('@/services/SpeechSynthesis');
jest.mock('axios', () => ({
  put: jest.fn(() => Promise.reject()),
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

  it('position is put successfully', () => {
    const wrapper = factory();
    wrapper.vm.showPosition({ coords: { latitude: '21.343234', longitude: '12.345344' } });
    wrapper.vm.$nextTick(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it('error message is shown', () => {
    const wrapper = factory();
    wrapper.vm.error('ERROR');
    wrapper.vm.$nextTick(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('test SpeechRecognitionLogic.js mixin', () => {
    it('route change, when userInput equals keyword', () => {
      const keywords = ['trainer', 'commute', 'restaurant', 'travel'];
      const wrapper = factory();
      for (let i = 0; i < keywords.length; i += 1) {
        wrapper.vm.checkForUseCase(keywords[i]);
        expect(router.currentRoute.name).toBe(keywords[i]);
      }
      wrapper.vm.checkForUseCase('home');
      expect(router.currentRoute.name).toBe('landingPage');
    });

    it('time is read, when user inputs time keyword', () => {
      const wrapper = factory();
      wrapper.vm.checkForUseCase('time');
      expect(SpeechService.speak).toHaveBeenCalled();
    });

    it('userInput watcher calls function', () => {
      const wrapper = factory();
      const spy = jest.spyOn(wrapper.vm, 'checkForUseCase');
      wrapper.vm.userInput = 'Test';
      wrapper.vm.$nextTick(() => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
