import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import SpeechRecognition from '@/components/SpeechRecognition.vue';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: SpeechRecognition,
  },
];
const router = new VueRouter({
  routes,
});

function factory() {
  return mount(SpeechRecognition, {
    localVue,
    router,
  });
}


describe('SpeechRecognition.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', () => {
      const wrapper = factory();
      expect(wrapper).toMatchSnapshot();
    });

    it('mute button renders, if listening', () => {
      const wrapper = factory();
      wrapper.vm.listening = true;
      wrapper.vm.$nextTick(() => {
        expect(wrapper.find('#muteButton').isVisible()).toBe(true);
      });
    });

    it('unmute button renders, if !listening', () => {
      const wrapper = factory();
      wrapper.vm.listening = false;
      wrapper.vm.$nextTick(() => {
        expect(wrapper.find('#unmuteButton').isVisible()).toBe(true);
      });
    });
  });

  describe('methods are working', () => {
    it('capitalize method capitalizes', () => {
      const wrapper = factory();
      expect(wrapper.vm.capitalize('test')).toBe('Test');
    });

    it('speech recognition is stoped', () => {
      const wrapper = factory();
      const spy = jest.spyOn(wrapper.vm, 'stopSpeechRecognition');
      wrapper.vm.stopSpeechRecognition();
      wrapper.vm.$nextTick(() => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('userInput is emitted if not empty', () => {
      const wrapper = factory();
      wrapper.setProps({ userInput: 'Hello Gunter' });
      wrapper.vm.startSpeechRecognition();
      expect(wrapper.emitted('update:user-input')[0]).toEqual(['Hello Gunter ']);
    });
  });

  describe('speech recognition action listeners working', () => {
    it('recognition.onend working', () => {
      const wrapper = factory();
      wrapper.vm.recognition.onend();
      expect(wrapper.vm.recognizing).toBe(false);
    });

    it('recognition.onerror working', () => {
      const wrapper = factory();
      wrapper.vm.recognition.onerror({ error: 'service-not-allowed' });
      expect(wrapper.vm.autoRestart).toBe(false);
    });

    describe('recognition.onresult working', () => {
      it('end recognition with interim result', () => {
        const wrapper = factory();
        wrapper.vm.recognition.onresult({
          resultIndex: 0,
          results: { length: 1, 0: { isFinal: false, 0: { transcript: 'Test' } } },
        });
        expect(wrapper.vm.interimResult).toBe('Test');
      });

      it('end recognition with final transcript', () => {
        const wrapper = factory();
        wrapper.vm.recognition.onresult({
          resultIndex: 0,
          results: { length: 1, 0: { isFinal: true, 0: { transcript: 'Test' } } },
        });
        expect(wrapper.vm.isFinal).toBe(true);
      });
    });

    it('recognition.onstart working', () => {
      const wrapper = factory();
      wrapper.vm.recognition.onstart();
      expect(wrapper.vm.recognizing).toBe(true);
    });
  });
});
