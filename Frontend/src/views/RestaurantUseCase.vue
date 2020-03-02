<template>
  <div />
</template>


<script>
export default {
  created() {
    const utterance = new SpeechSynthesisUtterance('Restaurant Use Cases.');
    utterance.rate = 1.2;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  },
};
</script>
