<template>
  <div
    id="trainer"
    class="hero-body"
  >
    <div class="container">
      <h1 class="title has-text-black">
        Trainer
      </h1>
    </div>
  </div>
</template>

<script>
import SpeechService from '@/services/SpeechSynthesis';

export default {
  created() {
    SpeechService.speak('Trainer Use Cases');
  },
};
</script>

<style scoped>
.hero-body {
  margin: 0rem 3rem 3rem 3rem;
  background-color: lightgrey;
}
</style>
