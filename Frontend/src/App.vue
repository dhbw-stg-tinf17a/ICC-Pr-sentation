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
    '$route.fullPath': function () {
      this.userInput = '';
      speechSynthesis.cancel();
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
