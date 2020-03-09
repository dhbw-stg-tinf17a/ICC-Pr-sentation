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
    const serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service worker ✔');

    // not necessarily required, implied by serviceWorkerRegistration.pushManager.subscribe
    const notificationPermission = await Notification.requestPermission();
    if (notificationPermission === 'granted') {
      console.log('Notification permission ✔');
    } else {
      console.log('Notification permission ✘');
      return;
    }

    const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BBauGh8G3IdDf28vFQD0-Nn-8wniZUsCjvRa0F0MbRUTmy0NDDGQCT-OD3M5k8c54DNsyw9-_SwibbBXxWYG_nk',
    });
    console.log('Push subscription ✔');

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushSubscription),
    });
    console.log('Push subscription sent to server ✔');
  } catch (err) {
    console.log('Something went wrong: ', err);
  }
});
