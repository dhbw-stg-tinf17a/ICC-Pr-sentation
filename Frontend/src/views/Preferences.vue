<template>
  <div class="container">
    <div class="section">
      <h1 class="title">
        Preferences
      </h1>

      <div class="field">
        <b-checkbox v-model="notificationsEnabled">
          Send notifications
        </b-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  watch: {
    async notificationsEnabled() {
      if (this.notificationsEnabled) {
        await this.enableNotifications();
      } else {
        await this.disableNotifications();
      }
    },
  },

  methods: {
    async enableNotifications() {
      try {
        const notificationPermission = await Notification.requestPermission();
        if (notificationPermission !== 'granted') {
          this.$buefy.snackbar.open({
            message: 'Unfortunately, Gunter doesn\'t have permission to send you notifications. Please check your browser settings.',
            type: 'is-danger',
          });
          this.notificationsEnabled = false;
          return;
        }

        const serviceWorkerRegistration = await navigator.serviceWorker.ready;
        const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BBauGh8G3IdDf28vFQD0-Nn-8wniZUsCjvRa0F0MbRUTmy0NDDGQCT-OD3M5k8c54DNsyw9-_SwibbBXxWYG_nk',
        });

        const response = await fetch('/api/notifications/enable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pushSubscription),
        });
        if (!response.ok) {
          throw await response.text();
        }
      } catch (err) {
        console.error(err);
        this.$buefy.snackbar.open({
          message: 'Unfortunately, Gunter couldn\'t enable notifications for you. He doesn\'t know why and is truly sorry.',
          type: 'is-danger',
        });
        this.notificationsEnabled = false;
      }
    },

    async disableNotifications() {
      try {
        const response = await fetch('/api/notifications/disable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw await response.text();
        }
      } catch (err) {
        console.error(err);
        this.$buefy.snackbar.open({
          message: 'Unfortunately, Gunter couldn\'t enable notifications for you. He doesn\'t know why and is truly sorry.',
          type: 'is-danger',
        });
        this.notificationsEnabled = false;
      }
    },
  },
};
</script>
