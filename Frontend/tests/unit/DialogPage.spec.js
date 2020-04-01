import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import mockAxios from 'axios';
import DialogPage from '@/views/DialogPage.vue';

const localVue = createLocalVue();
localVue.use(Buefy);

jest.mock('vue-quick-chat/dist/vue-quick-chat.css', () => jest.fn());
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({})),
  create: () => mockAxios,
  defaults: {
    adapter: {},
  },
}));

function factory() {
  return mount(DialogPage, {
    localVue,
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
  });

  // it('geolocation error message is shown', () => {
  //   const wrapper = factory();
  //   wrapper.vm.error('ERROR');
  //   wrapper.vm.$nextTick(() => {
  //     expect(wrapper).toMatchSnapshot();
  //   });
  // });
});
