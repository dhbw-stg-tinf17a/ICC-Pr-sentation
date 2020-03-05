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
      }
    },
  },
};
