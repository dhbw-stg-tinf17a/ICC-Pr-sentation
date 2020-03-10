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
      <h1 class="title">
        Preferences for {{ user.name }}
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
        <div class="column">
          <h1>hi</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from '../services/User';

export default {
  data() {
    return {
      user: null,
      loading: true,
    };
  },
  created() {
    const utterance = new SpeechSynthesisUtterance('Edit your Preferences.');
    utterance.rate = 1.3;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);

    UserService.getUser().then((result) => {
      this.user = result.data.data;
      this.loading = false;
    });
  },
  methods: {
    savePreferences() {
      this.$buefy.toast.open({
        message: 'Data theoretically saved! (Not yet implemented.)',
        duration: 3000,
        type: 'is-success',
      });

      const utterance = new SpeechSynthesisUtterance('Saved successfully.');
      utterance.rate = 1.3;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
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
