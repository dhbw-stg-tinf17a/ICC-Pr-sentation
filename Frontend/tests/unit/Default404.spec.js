import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import Default404 from '@/views/Default404.vue';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);

const routes = [
  {
    path: '/default',
    name: 'landingPage',
    component: Default404,
  },
];
const router = new VueRouter({
  routes,
});

function factory() {
  return mount(Default404, {
    localVue,
    router,
  });
}

describe('Default404.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', () => {
      const wrapper = factory();
      expect(wrapper).toMatchSnapshot();
    });

    it('Link to home page is displayed', () => {
      const wrapper = factory();
      expect(wrapper.find('.router-link').exists()).toBe(true);
    });
  });
});
