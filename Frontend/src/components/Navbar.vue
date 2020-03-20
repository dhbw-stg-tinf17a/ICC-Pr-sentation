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
    <template slot="end">
      <b-navbar-item tag="div">
        <router-link
          class="button is-white"
          :to="{name: 'dialog', query: {usecase: 'commute'}}"
        >
          <span class="icon">
            <i class="fas fa-train" />
          </span>
          <span>Commute</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white"
          :to="{name: 'dialog', query: {usecase: 'travel'}}"
        >
          <span class="icon">
            <i class="fas fa-plane-departure" />
          </span>
          <span>Travel</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white"
          :to="{name: 'dialog', query: {usecase: 'restaurant'}}"
        >
          <span class="icon">
            <i class="fas fa-utensils" />
          </span>
          <span>Restaurant</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white"
          :to="{name: 'dialog', query: {usecase: 'trainer'}}"
        >
          <span class="icon">
            <i class="fas fa-swimmer" />
          </span>
          <span>Trainer</span>
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
  computed: {
    currentRoute() {
      return this.$route.name;
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
