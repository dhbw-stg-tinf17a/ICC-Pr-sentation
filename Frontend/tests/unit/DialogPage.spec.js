import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import DialogPage from '@/views/DialogPage.vue';

const localVue = createLocalVue();
localVue.use(Buefy);

jest.mock('vue-quick-chat/dist/vue-quick-chat.css', () => jest.fn());

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
});
