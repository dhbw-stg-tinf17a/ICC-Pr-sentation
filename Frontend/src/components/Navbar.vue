<template>
  <b-navbar>
    <template slot="brand">
      <b-navbar-item tag="div">
        <router-link
          to="/"
        >
          <img
            src="../assets/logo.jpg"
            width="150"
            height="150"
            alt="Logo"
          >
        </router-link>
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-navbar-item tag="div">
        <slot />
      </b-navbar-item>
      <b-navbar-item tag="div">
        <b-tooltip
          label="Sound Off"
          position="is-bottom"
          type="is-light"
        >
          <button
            v-if="soundEnabled"
            class="button is-info"
            @click="muteSound"
          >
            <span class="icon">
              <i class="fas fa-volume-up fa-2x" />
            </span>
          </button>
        </b-tooltip>
        <b-tooltip
          label="Sound On"
          position="is-bottom"
          type="is-light"
        >
          <button
            v-if="!soundEnabled"
            id="unmuteButton"
            class="button is-info"
            @click="unmuteSound"
          >
            <span class="icon">
              <i class="fas fa-volume-off fa-2x" />
            </span>
          </button>
        </b-tooltip>
      </b-navbar-item>
    </template>
    <template slot="end">
      <b-navbar-item tag="div">
        <router-link
          class="button is-white is-outlined"
          :to="{name: 'dialog', query: {usecase: 'morning-routine'}}"
        >
          <span class="icon">
            <i class="fas fa-train" />
          </span>
          <span>Morning Routine</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white is-outlined"
          :to="{name: 'dialog', query: {usecase: 'travel-planning'}}"
        >
          <span class="icon">
            <i class="fas fa-plane-departure" />
          </span>
          <span>Travel Planning</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white is-outlined"
          :to="{name: 'dialog', query: {usecase: 'lunch-break'}}"
        >
          <span class="icon">
            <i class="fas fa-utensils" />
          </span>
          <span>Lunch Break</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white is-outlined"
          :to="{name: 'dialog', query: {usecase: 'personal-trainer'}}"
        >
          <span class="icon">
            <i class="fas fa-swimmer" />
          </span>
          <span>Personal Trainer</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <div class="field has-addons">
          <p class="control">
            <router-link
              class="button is-white"
              :class="{'is-outlined': currentRoute !== 'calendar'}"
              to="calendar"
            >
              <span class="icon">
                <i class="far fa-calendar-alt fa-2x" />
              </span>
            </router-link>
          </p>
          <p class="control">
            <router-link
              class="button is-white"
              :class="{'is-outlined': currentRoute !== 'preferences'}"
              to="preferences"
            >
              <span class="icon">
                <i class="fas fa-cog fa-2x" />
              </span>
            </router-link>
          </p>
          <div class="control">
            <router-link
              class="button is-white"
              :class="{'is-outlined': currentRoute !== 'help'}"
              to="help"
            >
              <span class="icon">
                <i class="fas fa-question-circle fa-2x" />
              </span>
            </router-link>
          </div>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  data() {
    return {
      soundEnabled: localStorage.getItem('soundEnabled') === 'true',
    };
  },
  computed: {
    currentRoute() {
      return this.$route.name;
    },
  },
  methods: {
    muteSound() {
      this.soundEnabled = false;
      localStorage.setItem('soundEnabled', false);
      speechSynthesis.cancel();
    },
    unmuteSound() {
      this.soundEnabled = true;
      localStorage.setItem('soundEnabled', true);
    },
  },
};
</script>

<style scoped>
.navbar-item img {
  max-height: 4rem;
}
.navbar {
  margin: 0 1rem 0 1rem;
}
</style>

<style>
.navbar-burger, .navbar-burger:hover {
  background-color: white;
}
</style>
