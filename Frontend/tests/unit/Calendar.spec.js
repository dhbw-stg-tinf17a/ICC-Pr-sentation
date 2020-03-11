import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import Calendar from '@/views/Calendar.vue';

const localVue = createLocalVue();
localVue.use(Buefy);

function factory() {
  return mount(Calendar, {
    localVue,
  });
}

describe('Calendar.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', () => {
      const wrapper = factory();
      expect(wrapper).toMatchSnapshot();
    });

    it('Loading Animation renders', () => {
      const wrapper = factory();
      expect(wrapper.find('.loading-overlay').exists()).toBe(true);
    });

    it('Calendar renders ', () => {
      const wrapper = factory();
      wrapper.vm.iframeLoading = false;
      wrapper.vm.$nextTick(() => {
        expect(wrapper.find('iframe').isVisible()).toBe(true);
      });
    });
  });

  it('Stop loading, if Calendar is loaded', () => {
    const wrapper = factory();
    wrapper.vm.$nextTick(() => {
      wrapper.find('iframe').trigger('load');
    });
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.iframeLoading).toBe(false);
    });
  });
});
