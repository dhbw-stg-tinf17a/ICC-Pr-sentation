<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link
          id="logo"
          to="/"
        >
          <img
            src="../assets/logo.jpg"
            width="150"
            height="150"
            alt="Logo"
          >
        </router-link>
        <span
          class="navbar-burger burger"
          data-target="navbarMenu"
        >
          <span />
          <span />
          <span />
        </span>
      </div>
      <div
        id="navbarMenu"
        class="navbar-menu"
      >
        <div class="navbar-end">
          <span class="navbar-item">
            <router-link
              class="button is-white is-outlined"
              :to="{name: 'commute'}"
            >
              <span class="icon">
                <i class="fas fa-train" />
              </span>
              <span>Commute</span>
            </router-link>
          </span>
          <span class="navbar-item">
            <router-link
              class="button is-white is-outlined"
              :to="{name: 'travel'}"
            >
              <span class="icon">
                <i class="fas fa-plane-departure" />
              </span>
              <span>Travel</span>
            </router-link>
          </span>
          <span class="navbar-item">
            <router-link
              class="button is-white is-outlined"
              to="restaurant"
            >
              <span class="icon">
                <i class="fas fa-utensils" />
              </span>
              <span>Restaurant</span>
            </router-link>
          </span>
          <span class="navbar-item">
            <router-link
              class="button is-white is-outlined"
              to="trainer"
            >
              <span class="icon">
                <i class="fas fa-swimmer" />
              </span>
              <span>Trainer</span>
            </router-link>
          </span>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
#logo {
    padding-top: 1rem;
}
</style>
