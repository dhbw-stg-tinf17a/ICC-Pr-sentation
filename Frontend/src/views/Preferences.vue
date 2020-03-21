<template>
  <div
    id="preferences"
    class="hero-body"
  >
    <b-loading
      :is-full-page="false"
      :active.sync="loading"
      :can-cancel="true"
    />
    <div
      v-if="!loading"
      class="container"
    >
      <h1
        v-if="user.name"
        class="title"
      >
        Preferences for {{ user.name }}
      </h1>
      <h1
        v-else
        class="title"
      >
        Preferences for User
      </h1>
      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label has-text-white">Name</label>
            <div class="control">
              <input
                v-model="user.name"
                class="input"
                type="text"
                placeholder="Name"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Preparation Time in Minutes</label>
            <div class="control">
              <input
                v-model="user.preferences.preparationTimeInMinutes"
                class="input"
                type="text"
                placeholder="Preparation Time in Minutes"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Favourite Quote Category</label>
            <div class="control">
              <input
                v-model="user.preferences.quoteCategory"
                class="input"
                type="text"
                placeholder="Favourite Quote Category"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Main City</label>
            <div class="control">
              <input
                v-model="user.preferences.weatherCity"
                class="input"
                type="text"
                placeholder="Main City"
              >
            </div>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label has-text-white">Current Location</label>
            <div class="control">
              <input
                v-model="user.preferences.currentLocationCoordinates"
                disabled
                class="input"
                type="text"
                placeholder="Current Location"
              >
            </div>
          </div>
          <div class="field">
            <b-checkbox
              v-model="notificationsEnabled"
              @input="toggleNotifications"
            >
              Send notifications to this device
            </b-checkbox>
          </div>
          <div class="field is-grouped is-grouped-right">
            <p class="control">
              <router-link
                class="button is-light"
                :to="{name: 'landingPage'}"
              >
                Cancel
              </router-link>
            </p>
            <p class="control">
              <a
                class="button is-success"
                @click="savePreferences()"
              >
                Save
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SpeechService from '@/services/SpeechSynthesis';
import UserService from '@/services/User';

export default {
  data() {
    return {
      user: null,
      loading: true,
    };
  },

  created() {
    if (this.$store.get('soundEnabled')) SpeechService.speak('Edit your Preferences');
    this.getUser();
  },

  methods: {
    getUser() {
      UserService.getUser().then((result) => {
        this.user = result.data.data;
        this.loading = false;
      });
    },
    savePreferences() {
      this.$buefy.toast.open({
        message: 'Data theoretically saved! (Not yet implemented.)',
        duration: 3000,
        type: 'is-success',
      });

      if (this.$store.get('soundEnabled')) SpeechService.speak('Saved successfully.');
    },

    async toggleNotifications() {
      if (this.notificationsEnabled) {
        await this.enableNotifications();
      } else {
        await this.disableNotifications();
      }
    },

    async enableNotifications() {
      try {
        const notificationPermission = await Notification.requestPermission();
        if (notificationPermission !== 'granted') {
          this.$buefy.snackbar.open({
            message: 'Unfortunately, Gunter doesn\'t have permission to send you notifications on this device. Please check your browser settings.',
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

        this.notificationEndpoint = pushSubscription.endpoint;
      } catch (err) {
        this.$buefy.snackbar.open({
          message: 'Unfortunately, Gunter couldn\'t enable notifications for you on this device. He doesn\'t know why and is truly sorry.',
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
          body: JSON.stringify({
            endpoint: this.notificationEndpoint,
          }),
        });
        if (!response.ok) {
          throw await response.text();
        }

        this.notificationEndpoint = '';
      } catch (err) {
        this.$buefy.snackbar.open({
          message: 'Unfortunately, Gunter couldn\'t disable notifications for you on this device. He doesn\'t know why and is truly sorry.',
          type: 'is-danger',
        });
        this.notificationsEnabled = true;
      }
    },
  },
};
</script>

<style scoped>
.hero-body {
  position: relative;
  margin: 0rem 3rem 3rem 3rem;
}
</style>
