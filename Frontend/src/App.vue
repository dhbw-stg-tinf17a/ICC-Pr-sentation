<template>
  <section class="hero is-info is-fullheight">
    <div class="hero-head">
      <Navbar>
        <SpeechRecognition
          ref="speechRecognitionComponent"
          :user-input="userInput"
          @update:user-input="userInput = $event"
        />
      </Navbar>
    </div>

    <router-view
      ref="routerView"
      :user-input="userInput"
      @update:user-input="userInput = $event"
    />
  </section>
</template>

<script>
import SpeechService from '@/services/SpeechSynthesis';
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
  watch: {
    // eslint-disable-next-line func-names
    '$route.name': function () {
      this.userInput = '';
    },
  },
  created() {
    this.$buefy.dialog.confirm({
      message: 'This Page talks to you!',
      type: 'is-success',
      onConfirm: () => {
        if (localStorage.getItem('soundEnabled') === 'true') SpeechService.speak('Hello my name is Gunter!');
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
        message: `Error ${error.response.data.status}: ${error.response.data.error}`,
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
