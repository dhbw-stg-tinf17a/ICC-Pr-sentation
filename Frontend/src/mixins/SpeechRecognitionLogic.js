import SpeechService from '@/services/SpeechSynthesis';

export default {
  data() {
    return {
      usecase: ['morning-routine', 'personal-trainer', 'lunch-break', 'travel-planning'],
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
            // transformation to get 'morningRoutineUseCase' out of morning-routine
            const functionName = `${this.usecase[i].split('-')[0]
            + this.usecase[i].charAt(this.usecase[i].indexOf('-') + 1).toUpperCase()
            + this.usecase[i].split('-')[1].substr(1)}UseCase`;
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
        const time = today.toLocaleTimeString('en-us', {
          hour: '2-digit',
          minute: '2-digit',
        });
        if (localStorage.getItem('soundEnabled') === 'true' && !speechSynthesis.speaking) {
          SpeechService.speak(`Currently it is: ${time}`);
        }
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('yes')) {
        this.$refs.routerView.userConfirmed(userInput);
        this.userInput = '';
      }
    },
  },
};
