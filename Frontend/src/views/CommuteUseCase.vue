<template>
  <div
    id="commute"
    class="hero-body"
  >
    <div class="container">
      <h1 class="title has-text-black">
        Commute
      </h1>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    const utterance = new SpeechSynthesisUtterance('Commute Use Cases.');
    utterance.rate = 1.2;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  },
};
</script>

<style scoped>
.hero-body {
  margin: 0rem 3rem 3rem 3rem;
  background-color: lightgrey;
}
</style>
