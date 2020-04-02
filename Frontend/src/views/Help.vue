<template>
  <div
    id="help"
    class="hero-body"
  >
    <div class="container">
      <div class="columns">
        <div class="column">
          <h1 class="title">
            Help Section
          </h1>
          <br>
          <h2 class="subtitle">
            What is Gunter?
          </h2>
          <p>
            Gunter is an intelligent Personal Digital Assistant.
            You can talk to him and he will talk to you.<br>
            Gunter offers four fundamental use cases which you can navigate to
            with the buttons in the Navbar or via speech.
          </p>
          <br>
          <h2 class="subtitle">
            The Use Cases
          </h2>
          <p>Morning routine: Notification when you have to get up</p>
          <p>Travel planning: Notification about low travel prices</p>
          <p>Lunch break: Shows you nice restaurants for your lunch break</p>
          <p>Personal trainer: Tells you when you can do sports</p>
        </div>
        <div class="column">
          <h2 class="subtitle">
            Everything you can say to Gunter
          </h2>
          <table class="table">
            <thead>
              <tr>
                <th>Command</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Morning</th>
                <th>Switch to morning routine use case</th>
              </tr>
              <tr>
                <th>Travel</th>
                <th>Switch to travel planning use case</th>
              </tr>
              <tr>
                <th>Lunch</th>
                <th>Switch to lunch break use case</th>
              </tr>
              <tr>
                <th>Training</th>
                <th>Switch to personal trainer use case</th>
              </tr>
              <tr>
                <th>Calendar</th>
                <th>Switch to calendar</th>
              </tr>
              <tr>
                <th>Preferences</th>
                <th>Switch to preferences</th>
              </tr>
              <tr>
                <th>Help</th>
                <th>Show this help page</th>
              </tr>
              <tr>
                <th>Time</th>
                <th>Gunter tells you the current time</th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SpeechService from '@/services/SpeechSynthesis';

export default {
  created() {
    if (localStorage.getItem('soundEnabled') === 'true') {
      SpeechService.speak('This is the help section. '
    + 'Here you can see an overview of what I can do!');
    }
  },
};
</script>

<style scoped>
.subtitle {
  text-decoration: underline;
}
.hero-body {
  position: relative;
  margin: 0rem 3rem 3rem 3rem;
  padding-top: 1rem;
}
</style>
