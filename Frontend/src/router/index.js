import Vue from 'vue';
import VueRouter from 'vue-router';

const LandingPage = () => import('../views/LandingPage.vue');
const Help = () => import('../views/Help.vue');
const Default404 = () => import('../views/Default404.vue');
const Preferences = () => import('../views/Preferences.vue');
const Calendar = () => import('../views/Calendar.vue');
const DialogPage = () => import('../views/DialogPage.vue');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'landingPage',
    component: LandingPage,
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
    path: '/dialog',
    name: 'dialog',
    component: DialogPage,
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
