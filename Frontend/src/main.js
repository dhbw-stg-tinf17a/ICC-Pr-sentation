import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import Vue from 'vue';
import persistentState from 'vue-persistent-state';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

Vue.use(Buefy);

Vue.use(persistentState, {
  notificationsEnabled: true,
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');

window.addEventListener('load', async () => {
  await navigator.serviceWorker.register('/service-worker.js');
});
