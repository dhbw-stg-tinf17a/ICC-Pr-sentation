import { createLocalVue, mount } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import mockAxios from 'axios';
import Preferences from '@/views/Preferences.vue';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'landingPage',
    component: Preferences,
  },
];
const router = new VueRouter({
  routes,
});

const mockPreferences = {
  data: {
    calendarURL: 'https://calendar.google.com/calendar/ical/wetzelmanuel0%40gmail.com/private-96d8601189d09d1ff0b902d950a20545/basic.ics',
    location: { latitude: '48.5133487999999', longitude: '9.0589357' },
    lunchBreakStart: { hour: 11, minute: 0 },
    lunchBreakEnd: { hour: 14, minute: 0 },
    lunchBreakRequiredMinutes: '5',
    lunchBreakMaxDistance: '66',
    lunchBreakMinutesBeforeStart: '7',
    morningRoutineMinutesForPreparation: '1',
    morningRoutineQuoteCategory: 'students',
    personalTrainerStart: { hour: 15, minute: 0 },
    personalTrainerEnd: { hour: 22, minute: 0 },
    personalTrainerRequiredMinutes: '2',
    personalTrainerMaxDistance: '3',
    personalTrainerMinutesBeforeStart: '4',
    travelPlanningMinDistance: '8',
  },
};

jest.mock('@/services/SpeechSynthesis');
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve(mockPreferences)),
  patch: jest.fn(() => Promise.resolve()),
  create: () => mockAxios,
  defaults: {
    adapter: {},
  },
}));

function factory() {
  return mount(Preferences, {
    localVue,
    router,
  });
}

describe('Preferences.vue', () => {
  describe('Elements are rendered correctly', () => {
    it('Component renders', async () => {
      const wrapper = factory();
      await wrapper.vm.getPreferences();
      wrapper.vm.$nextTick(() => {
        expect(wrapper).toMatchSnapshot();
      });
    });

    it('loading animation is shown', () => {
      const wrapper = factory();
      expect(wrapper.find('.loading-overlay').exists()).toBe(true);
    });

    it('title is rendered', async () => {
      const wrapper = factory();
      await wrapper.vm.getPreferences();
      wrapper.vm.$nextTick(() => {
        expect(wrapper.find('.title').text()).toBe('Preferences for Gunter');
      });
    });
  });

  describe('functionality works', () => {
    it('preferences are saved', async () => {
      const wrapper = factory();
      await wrapper.vm.getPreferences();
      wrapper.vm.$nextTick(() => {
        const spy = jest.spyOn(wrapper.vm, 'savePreferences');
        wrapper.find('.button.is-success').trigger('click');
        expect(spy).toHaveBeenCalled();
      });
    });

    it('notifications can be toggled on', async () => {
      const wrapper = factory();
      await wrapper.vm.getPreferences();
      wrapper.vm.$nextTick(() => {
        wrapper.vm.toggleNotifications();
        expect(wrapper.vm.notificationsEnabled).toBe(true);
      });
    });

    it('notifications can be toggled off', async () => {
      const wrapper = factory();
      await wrapper.vm.getPreferences();
      wrapper.vm.$nextTick(() => {
        wrapper.vm.toggleNotifications();
        wrapper.vm.toggleNotifications();
        expect(wrapper.vm.notificationsEnabled).toBe(true);
      });
    });
  });

  describe('methods work', () => {
    it('quote category is changed', async () => {
      const wrapper = factory();
      await wrapper.vm.getPreferences();
      wrapper.vm.changeSelectedQuoteCategory('TestCategory');
      expect(wrapper.vm.preferences.morningRoutineQuoteCategory).toEqual('TestCategory');
    });
  });
});
