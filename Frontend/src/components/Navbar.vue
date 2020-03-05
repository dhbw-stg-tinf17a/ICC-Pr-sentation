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
          class="button is-white is-outlined"
          to="commute"
        >
          <span class="icon">
            <i class="fas fa-train" />
          </span>
          <span>Commute</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white is-outlined"
          to="travel"
        >
          <span class="icon">
            <i class="fas fa-plane-departure" />
          </span>
          <span>Travel</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white is-outlined"
          to="restaurant"
        >
          <span class="icon">
            <i class="fas fa-utensils" />
          </span>
          <span>Restaurant</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <router-link
          class="button is-white is-outlined"
          to="trainer"
        >
          <span class="icon">
            <i class="fas fa-swimmer" />
          </span>
          <span>Trainer</span>
        </router-link>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <slot />
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<style scoped>
.navbar-item img {
  max-height: 4rem;
}
.navbar {
  margin: 0 1rem 0 1rem;
}
</style>
