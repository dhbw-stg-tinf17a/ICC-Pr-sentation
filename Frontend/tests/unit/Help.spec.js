import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import Help from '@/views/Help.vue';
import persistentState from 'vue-persistent-state';
import SpeechService from '@/services/SpeechSynthesis';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(persistentState, {
  soundEnabled: true,
  microphoneEnabled: true,
  notificationsEnabled: false,
  notificationEndpoint: '',
});

jest.mock('@/services/SpeechSynthesis');

function factory() {
  return mount(Help, {
    localVue,
  });
}

describe('Help.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', () => {
      const wrapper = factory();
      expect(wrapper).toMatchSnapshot();
    });

    it('Title renders', () => {
      const wrapper = factory();
      expect(wrapper.find('.title').text()).toBe('Help Section');
    });
  });

  it('SpeecheService is called on page enter', () => {
    factory();
    expect(SpeechService.speak).toHaveBeenCalled();
  });
});
