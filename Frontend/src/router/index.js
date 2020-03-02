import Vue from 'vue';
import VueRouter from 'vue-router';

const LandingPage = () => import('../views/LandingPage.vue');
const Commute = () => import('../views/CommuteUseCase.vue');
const Restaurant = () => import('../views/RestaurantUseCase.vue');
const Trainer = () => import('../views/TrainerUseCase.vue');
const Travel = () => import('../views/TravelUseCase.vue');

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
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
