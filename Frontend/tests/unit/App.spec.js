import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import mockAxios from 'axios';
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
];
const router = new VueRouter({
  routes,
});

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
});
