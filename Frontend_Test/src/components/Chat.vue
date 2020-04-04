<template>
  <div class="chat flex flex-col p-10">
    <div
      v-for="(message, i) of messages"
      :key="i"
      class="bubble bg-gray-900 text-gray-100 p-2 rounded-lg mb-1"
      :class="message.left ? 'self-start' : 'self-end'"
    >{{message.text}}</div>
  </div>
</template>

<script>
export default {
  setup() {
    return {
      messages: [
        { left: true, text: "Hi, I'm Gunter" },
        { left: true, text: "Ask me anything you want" },
        { left: false, text: "Morning routine" },
        {
          left: true,
          continued: false,
          text: "'Build a flux capacitor' starts at 9:00 am"
        }
      ]
    };
  }
};
</script>

<style>
.chat {
  min-width: 30rem;
}

.bubble {
  max-width: 15rem;
  margin-bottom: 0.1rem;
}

.bubble.self-start + .bubble.self-end,
.bubble.self-end + .bubble.self-start {
  @apply mt-2;
}
</style>
