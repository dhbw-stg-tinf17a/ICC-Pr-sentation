import Vue from 'vue';
import VueRouter from 'vue-router';

const LandingPage = () => import('../views/LandingPage.vue');
const Commute = () => import('../views/CommuteUseCase.vue');
const Restaurant = () => import('../views/RestaurantUseCase.vue');
const Trainer = () => import('../views/TrainerUseCase.vue');
const Travel = () => import('../views/TravelUseCase.vue');
const Help = () => import('../views/Help.vue');
const Default404 = () => import('../views/Default404.vue');
const Preferences = () => import('../views/Preferences.vue');
const Calendar = () => import('../views/Calendar.vue');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'landingPage',
    component: LandingPage,
  },
  {
    path: '/commute',
    name: 'commute',
    component: Commute,
  },
  {
    path: '/restaurant',
    name: 'restaurant',
    component: Restaurant,
  },
  {
    path: '/trainer',
    name: 'trainer',
    component: Trainer,
  },
  {
    path: '/travel',
    name: 'travel',
    component: Travel,
  },

  {
    path: '/help',
    name: 'help',
    component: Help,
  },
  {
    path: '/preferences',
    name: 'preferences',
    component: Preferences,
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: Calendar,
  },
  {
    path: '*',
    name: 'Default404',
    component: Default404,
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
