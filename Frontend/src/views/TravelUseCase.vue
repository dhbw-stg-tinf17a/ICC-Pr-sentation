<template>
  <div
    id="travel"
    class="container"
  >
    <h1>Travel Assistant</h1>
  </div>
</template>


<script>
export default {
  created() {
    const utterance = new SpeechSynthesisUtterance('Travel Use Cases.');
    utterance.rate = 1.2;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  },
};
</script>
