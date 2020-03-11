import SpeechService from '@/services/SpeechSynthesis';

export default {
  watch: {
    userInput() {
      this.checkForUseCase(this.userInput);
    },
  },
  methods: {
    // checks, if userInput contains any trigger word
    checkForUseCase(userInput) {
      if (userInput.toLowerCase().includes('trainer')) {
        if (this.$router.currentRoute.name !== 'trainer') this.$router.push({ name: 'trainer' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('commute')) {
        if (this.$router.currentRoute.name !== 'commute') this.$router.push({ name: 'commute' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('restaurant')) {
        if (this.$router.currentRoute.name !== 'restaurant') this.$router.push({ name: 'restaurant' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('travel')) {
        if (this.$router.currentRoute.name !== 'travel') this.$router.push({ name: 'travel' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('home')) {
        if (this.$router.currentRoute.name !== 'landingPage') this.$router.push({ name: 'landingPage' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('time')) {
        const today = new Date();
        const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

        SpeechService.speak(`Currently it is: ${time}`);
        this.userInput = '';
      }
    },
  },
};
