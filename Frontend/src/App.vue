<template>
  <section class="hero is-info is-fullheight">
    <div class="hero-head">
      <Navbar />
    </div>

    <router-view
      :user-input="userInput"
      @update:user-input="userInput = $event"
    >
      <SpeechRecognition
        :user-input="userInput"
        @update:user-input="userInput = $event"
      />
    </router-view>
  </section>
</template>

<script>
import Navbar from './components/Navbar.vue';
import SpeechRecognition from './components/SpeechRecognition.vue';
import SpeechRecognitionLogic from './mixins/SpeechRecognitionLogic';
import LocationService from './services/Location';

export default {
  components: {
    Navbar,
    SpeechRecognition,
  },
  mixins: [SpeechRecognitionLogic],
  data() {
    return {
      userInput: '',
    };
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
  beforeUpdate() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition, this.error);
    } else {
      this.$buefy.toast.open({
        message: 'Geolocation is not supported by this browser.',
        duration: 3000,
        type: 'is-danger',
      });
    }
  },
  methods: {
    showPosition(position) {
      LocationService.sendPosition({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }).catch((error) => this.$buefy.toast.open({
        message: error,
        duration: 3000,
        type: 'is-danger',
      }));
    },
    error(err) {
      this.$buefy.toast.open({
        message: `ERROR(${err.code}): ${err.message}`,
        duration: 3000,
        type: 'is-danger',
      });
    },
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
