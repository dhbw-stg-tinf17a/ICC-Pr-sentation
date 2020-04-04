<template>
  <div>
    <Bubble v-for="(message, i) of messages" :key="i" :text="message.text" />
  </div>
</template>

<script>
import Bubble from "./Bubble.vue";

export default {
  setup() {
    return {
      messages: [
        { gunter: true, text: "Hi, I'm Gunter" },
        { gunter: false, text: "Morning routine" },
        { gunter: true, text: "'Build a flux capacitor' starts at 9:00 am" }
      ]
    };
  },
  components: { Bubble }
};
</script>
