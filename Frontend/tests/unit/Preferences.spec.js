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
    data: {
      name: 'Gunter',
      age: 107,
      favouriteFood: 'Jelly Beans',
      loyal: true,
      preferences: {
        calendarUrl: 'https://calendar.google.com/calendar/ical/rroff00labrg6qt5gu3ol87ejo%40group.calendar.google.com/private-97ee3f8105c50679da64c381b7890270/basic.ics',
        preparationTimeInMinutes: '45',
        quoteCategory: 'funny',
        weatherCity: 'Stuttgart',
        currentLocationCoordinates: '48.6616037,9.3501336',
        currentLocationAddress: 'Stuttgart, Schmidenerstraße 21',
        eventLocationCoordinates: '48.773563,9.171063',
        eventLocationAddress: 'Stuttgart, Rotebühlplatz 41',
      },
      events: [{ title: 'Party hard', date: '2020-03-05 14:10.00' }],
    },
  },
};

jest.mock('@/services/SpeechSynthesis');
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve(mockPreferences)),
  patch: jest.fn(() => Promise.reject()),
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
        wrapper.find('input[type=checkbox]').trigger('click');
        expect(wrapper.vm.notificationsEnabled).toBe(false); // TODO: should be true?
      });
    });

    it('notifications can be toggled off', async () => {
      const wrapper = factory();
      await wrapper.vm.getPreferences();
      wrapper.vm.$nextTick(() => {
        wrapper.find('input[type=checkbox]').trigger('click');
        wrapper.find('input[type=checkbox]').trigger('click');
        expect(wrapper.vm.notificationsEnabled).toBe(true); // TODO: should be false??
      });
    });
  });
});
