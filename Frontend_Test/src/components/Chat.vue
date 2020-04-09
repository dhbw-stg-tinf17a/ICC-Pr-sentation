<template>
  <div class="flex flex-col justify-between">
    <div class="flex flex-col p-10">
      <div
        v-for="(message, i) of messages"
        :key="i"
        class="bubble bg-gray-900 text-gray-100 p-2 rounded-lg mb-1"
        :class="message.left ? 'self-start' : 'self-end'"
      >{{message.text}}</div>
    </div>

    <div class="p-10">
      <textarea
        class="w-full bg-gray-400 p-3 rounded-md focus:outline-none focus:shadow-outline text-gray-900 resize-none"
        ref="input"
        rows="1"
        @input="resizeInput"
        @keydown.enter="send"
        placeholder="Ask Gunter"
      />
    </div>
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
  },
  methods: {
    resizeInput(event) {
      event.target.style.height = `auto`;
      event.target.style.height = `${event.target.scrollHeight}px`;
    },
    send(event) {
      event.preventDefault();
      // TODO send to Gunter
    }
  }
};
</script>

<style>
.bubble {
  max-width: 15rem;
  margin-bottom: 0.1rem;
}

.bubble.self-start + .bubble.self-end,
.bubble.self-end + .bubble.self-start {
  @apply mt-2;
}
</style>
