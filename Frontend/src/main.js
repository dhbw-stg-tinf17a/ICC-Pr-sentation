import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

Vue.use(Buefy);

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');

window.addEventListener('load', async () => {
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  } catch (err) {
    console.log('ServiceWorker registration failed: ', err);
  }
});
