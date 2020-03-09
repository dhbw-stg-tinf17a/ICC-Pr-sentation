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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition, this.error);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  },
  methods: {
    showPosition(position) {
      console.log(`Latitude: ${position.coords.latitude
      } Longitude: ${position.coords.longitude}`);
    },
    error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
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
