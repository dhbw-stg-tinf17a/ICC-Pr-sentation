import SpeechService from '@/services/SpeechSynthesis';

export default {
  data() {
    return {
      usecase: ['commute', 'trainer', 'restaurant', 'travel'],
    };
  },
  watch: {
    userInput() {
      this.checkForUseCase(this.userInput);
    },
  },
  methods: {
    // checks, if userInput contains any trigger word
    checkForUseCase(userInput) {
      for (let i = 0; i < this.usecase.length; i += 1) {
        if (userInput.toLowerCase().includes(this.usecase[i])) {
          if (this.$route.query.usecase !== this.usecase[i]) this.$router.push({ name: 'dialog', query: { usecase: this.usecase[i] } });
          else {
            this.$refs.routerView.submitMyMessage(this.usecase[i]);
            const functionName = `${this.usecase[i]}UseCase`;
            this.$refs.routerView[functionName]();
          }
          this.userInput = '';
        }
      }
      if (userInput.toLowerCase().includes('help')) {
        if (this.$router.currentRoute.name !== 'help') this.$router.push({ name: 'help' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('preferences')) {
        if (this.$router.currentRoute.name !== 'preferences') this.$router.push({ name: 'preferences' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('calendar')) {
        if (this.$router.currentRoute.name !== 'calendar') this.$router.push({ name: 'calendar' });
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
