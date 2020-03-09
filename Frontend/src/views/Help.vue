<template>
  <div
    id="help"
    class="hero-body"
  >
    <div class="container">
      <h1 class="title">
        Help Section
      </h1>
      <div class="columns">
        <div class="column">
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
          <p>Commute: Notification when you have to get up</p>
          <p>Travel: Notification about low travel prices</p>
          <p>Restaurant: Shows you nice restaurants for your lunch break</p>
          <p>Trainer: Tells you when you can do sports</p>
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
                <th>Commute</th>
                <th>Switch to commute use case</th>
              </tr>
              <tr>
                <th>Travel</th>
                <th>Switch to travel use case</th>
              </tr>
              <tr>
                <th>Restaurant</th>
                <th>Switch to restaurant use case</th>
              </tr>
              <tr>
                <th>Trainer</th>
                <th>Switch to trainer use case</th>
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
export default {
  created() {
    const utterance = new SpeechSynthesisUtterance('This is the help section. '
    + 'Here you can see an overview of what I can do!');
    utterance.rate = 1.4;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  },
};
</script>

<style scoped>
.subtitle {
  text-decoration: underline;
}
</style>
