<template>
  <section class="hero is-info is-fullheight">
    <div class="hero-head">
      <nav class="navbar">
        <div class="container">
          <div class="navbar-brand">
            <router-link
              id="logo"
              to="/"
            >
              <img
                src="./assets/logo.jpg"
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
    </div>

    <router-view />
  </section>
</template>

<script>
export default {
  created() {
    this.$buefy.dialog.confirm({
      message: 'This Page talks to you!',
      type: 'is-success',
      onConfirm: () => {
        const utterance = new SpeechSynthesisUtterance('Hello my name is Gunter!');
        utterance.rate = 1.3;
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
      },
    });
  },
};
</script>

<style scoped>
#logo {
    padding-top: 1rem;
}
.hero.is-info {
  background: linear-gradient(
      rgba(0, 0, 0, 0.5),
      rgba(0, 0, 0, 0.5)
    ), url('./assets/wallpaper.jpg') no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
.hero .nav, .hero.is-success .nav {
  -webkit-box-shadow: none;
  box-shadow: none;
}
.hero .subtitle {
  padding: 3rem 0;
  line-height: 1.5;
}
</style>
