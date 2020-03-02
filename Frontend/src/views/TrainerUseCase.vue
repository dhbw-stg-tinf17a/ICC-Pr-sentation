<template>
  <div
    id="trainer"
    class="container"
  >
    <h1>Personal Trainer</h1>
  </div>
</template>

<script>
export default {
  created() {
    const utterance = new SpeechSynthesisUtterance('Trainer Use Cases.');
    utterance.rate = 1.2;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  },
};
</script>

<style scoped>

</style>
