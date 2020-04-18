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
        class="title"
      >
        Preferences for Gunter
      </h1>
      <div class="field">
        <label class="label has-text-white">Calendar URL</label>
        <div class="control">
          <input
            v-model="preferences.calendarURL"
            class="input"
            type="text"
            placeholder="Calendar URL"
          >
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="subtitle">
            Morning Routine
          </h2>
          <div class="field">
            <label class="label has-text-white">Preparation Time (min)</label>
            <div class="control">
              <input
                v-model="preferences.morningRoutineMinutesForPreparation"
                class="input"
                type="number"
                placeholder="Time to get ready"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Favourite Quote Category</label>
            <div class="control">
              <div class="select">
                <select @click="changeSelectedQuoteCategory($event.target.value)">
                  <option
                    v-for="(quoteCategory, index) in quoteCategories"
                    :key="index"
                    :selected="preferences.morningRoutineQuoteCategory === quoteCategory"
                  >
                    {{ quoteCategory }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <h2 class="subtitle">
            Travel Planning
          </h2>
          <div class="field">
            <label class="label has-text-white">Min. Distance (km)</label>
            <div class="control">
              <input
                v-model="preferences.travelPlanningMinDistance"
                class="input"
                type="number"
                placeholder="Minimum Distance"
              >
            </div>
          </div>
        </div>
        <div class="column">
          <h2 class="subtitle">
            Personal Trainer
          </h2>
          <div class="field">
            <label class="label has-text-white">Min. Duration of Training (min)</label>
            <div class="control">
              <input
                v-model="preferences.personalTrainerRequiredMinutes"
                class="input"
                type="number"
                placeholder="Required Time in Minutes"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Max. Distance (km)</label>
            <div class="control">
              <input
                v-model="preferences.personalTrainerMaxDistance"
                class="input"
                type="number"
                placeholder="Maximum Distance"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Notification before Training (min)</label>
            <div class="control">
              <input
                v-model="preferences.personalTrainerMinutesBeforeStart"
                class="input"
                type="number"
                placeholder="Buffer before Training"
              >
            </div>
          </div>
        </div>
        <div class="column">
          <h2 class="subtitle">
            Lunch Break
          </h2>
          <div class="field">
            <label class="label has-text-white">Min. Duration of Lunch Break (min)</label>
            <div class="control">
              <input
                v-model="preferences.lunchBreakRequiredMinutes"
                class="input"
                type="number"
                placeholder="Required Time in Minutes"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Max. Distance (km)</label>
            <div class="control">
              <input
                v-model="preferences.lunchBreakMaxDistance"
                class="input"
                type="number"
                placeholder="Maximum Distance"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Notification before Break (min)</label>
            <div class="control">
              <input
                v-model="preferences.lunchBreakMinutesBeforeStart"
                class="input"
                type="number"
                placeholder="Buffer before lunch break"
              >
            </div>
          </div>
        </div>
        <div class="column">
          <h2 class="subtitle">
            General
          </h2>
          <div class="field">
            <label class="label has-text-white">Home location latitude</label>
            <div class="control">
              <input
                v-model="preferences.location.latitude"
                class="input"
                type="number"
                placeholder="Latitude"
              >
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Home location longitude</label>
            <div class="control">
              <input
                v-model="preferences.location.longitude"
                class="input"
                type="number"
                placeholder="Longitude"
              >
            </div>
          </div>
          <div class="field">
            <b-switch
              v-model="notificationsEnabled"
              type="is-success"
              @input="toggleNotifications"
            >
              Send notifications to this device
            </b-switch>
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
import PreferencesService from '@/services/Preferences';

export default {
  data() {
    return {
      preferences: null,
      loading: true,
      notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true',
      quoteCategories: ['inspire', 'management', 'sports', 'life', 'funny', 'love', 'art', 'students'],
    };
  },
  watch: {
    notificationsEnabled() {
      localStorage.setItem('notificationsEnabled', this.notificationsEnabled);
    },
  },
  created() {
    SpeechService.speak('Edit your Preferences');
    this.getPreferences();
  },
  methods: {
    changeSelectedQuoteCategory(newCategory) {
      this.preferences.morningRoutineQuoteCategory = newCategory;
    },
    getPreferences() {
      PreferencesService.getPreferences().then((response) => {
        this.preferences = response.data;
        this.loading = false;
      });
    },
    savePreferences() {
      PreferencesService.updatePreferences(this.preferences).then(
        this.$buefy.toast.open({
          message: 'Preferences saved!',
          duration: 3000,
          type: 'is-success',
        }),
      ).catch((error) => {
        this.$buefy.toast.open({
          message: `Error ${error.response.status}: ${error.response.statusText}`,
          duration: 3000,
          type: 'is-danger',
        });
      });

      SpeechService.speak('Saved successfully.');
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
            message:
              "Unfortunately, Gunter doesn't have permission to send you notifications on this device. Please check your browser settings.",
            type: 'is-danger',
          });
          this.notificationsEnabled = false;
          return;
        }

        const serviceWorkerRegistration = await navigator.serviceWorker.ready;
        const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe(
          {
            userVisibleOnly: true,
            applicationServerKey:
              'BBauGh8G3IdDf28vFQD0-Nn-8wniZUsCjvRa0F0MbRUTmy0NDDGQCT-OD3M5k8c54DNsyw9-_SwibbBXxWYG_nk',
          },
        );

        const response = await fetch('/api/notifications/enable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pushSubscription),
        });
        if (!response.ok) {
          throw await response.text();
        }

        localStorage.setItem('notificationEndpoint', pushSubscription.endpoint);
      } catch (err) {
        this.$buefy.snackbar.open({
          message:
            "Unfortunately, Gunter couldn't enable notifications for you on this device. He doesn't know why and is truly sorry.",
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
            endpoint: localStorage.getItem('notificationEndpoint'),
          }),
        });
        if (!response.ok) {
          throw await response.text();
        }

        localStorage.setItem('notificationEndpoint', '');
      } catch (err) {
        this.$buefy.snackbar.open({
          message:
            "Unfortunately, Gunter couldn't disable notifications for you on this device. He doesn't know why and is truly sorry.",
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
  margin: 0rem 3rem 0rem 3rem;
  padding-top: 1rem;
}
.subtitle {
  text-decoration: underline;
}
</style>
