<template>
  <div>
    <div v-for="(message, i) of messages" :key="i">{{message.text}}</div>
  </div>
</template>

<script>
export default {
  setup() {
    return {
      messages: [
        { gunter: true, text: "Hi, I'm Gunter" },
        { gunter: false, text: "Morning routine" },
        { gunter: true, text: "'Build a flux capacitor' starts at 9:00 am" }
      ]
    };
  }
};
</script>
