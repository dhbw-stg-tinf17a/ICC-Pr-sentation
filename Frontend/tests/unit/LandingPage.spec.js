import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import LandingPage from '@/views/LandingPage.vue';

const localVue = createLocalVue();
localVue.use(Buefy);

function factory() {
  return mount(LandingPage, {
    localVue,
  });
}

describe('LandingPage.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', () => {
      const wrapper = factory();
      expect(wrapper).toMatchSnapshot();
    });

    it('Input field is shown', () => {
      const wrapper = factory();
      expect(wrapper.find('.input').isVisible()).toBe(true);
    });
  });
});
