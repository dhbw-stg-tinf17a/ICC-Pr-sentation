<template>
  <section class="hero is-info is-fullheight">
    <div class="hero-head">
      <Navbar />
    </div>

    <router-view />
  </section>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  components: {
    Navbar,
  },
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
</style>
