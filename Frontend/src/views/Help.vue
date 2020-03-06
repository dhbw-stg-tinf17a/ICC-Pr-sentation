<template>
  <div
    id="help"
    class="hero-body"
  >
    <h1 class="title">
      Help Section
    </h1>
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
