export default {
  watch: {
    userInput() {
      this.checkForUseCase(this.userInput);
    },
  },
  methods: {
    // checks, if userInput contains any use case name
    checkForUseCase(userInput) {
      if (userInput.toLowerCase().includes('trainer')) {
        this.$router.push({ name: 'trainer' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('commute')) {
        this.$router.push({ name: 'commute' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('restaurant')) {
        this.$router.push({ name: 'restaurant' });
        this.userInput = '';
      } else if (userInput.toLowerCase().includes('travel')) {
        this.$router.push({ name: 'travel' });
        this.userInput = '';
      }
    },
  },
};
