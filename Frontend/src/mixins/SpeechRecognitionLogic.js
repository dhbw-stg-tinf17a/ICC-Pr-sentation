import SpeechService from '@/services/SpeechSynthesis';

export default {
  data() {
    return {
      usecasesTrigger: [
        ['morning-routine', 'morningRoutineUseCase', 'Morning Routine', 'commute', 'morning', 'routine'],
        ['personal-trainer', 'personalTrainerUseCase', 'Personal Trainer', 'training', 'train', 'trainer'],
        ['lunch-break', 'lunchBreakUseCase', 'Lunch Break', 'lunch', 'lunchbreak'],
        ['travel-planning', 'travelPlanningUseCase', 'Travel Planning', 'travel', 'weekend', 'travelplanner'],
      ],
    };
  },
  watch: {
    userInput() {
      this.checkForTriggerWord(this.userInput);
    },
  },
  methods: {
    // checks, if userInput contains any trigger word
    checkForTriggerWord(userInput) {
      for (let i = 0; i < this.usecasesTrigger.length; i += 1) {
        if (this.usecasesTrigger[i].some((v) => userInput.toLowerCase().includes(v))) {
          if (this.$route.query.usecase !== this.usecasesTrigger[i][0]) {
            this.$router.push({
              name: 'dialog', query: { usecase: this.usecasesTrigger[i][0] },
            });
          } else {
            this.$refs.routerView.submitMyMessage(this.usecasesTrigger[i][2]);
            this.$refs.routerView[this.usecasesTrigger[i][1]]();
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
