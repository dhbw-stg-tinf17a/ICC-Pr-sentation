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
  await navigator.serviceWorker.register('/service-worker.js');

  navigator.serviceWorker.addEventListener('message', (event) => {
    const { usecase } = event.data;
    router.push({ path: `/dialog?usecase=${usecase}` });
  });
});
