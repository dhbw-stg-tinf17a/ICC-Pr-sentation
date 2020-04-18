<template>
  <div class="hero-body">
    <div
      id="container"
      class="container has-text-centered"
    >
      <div class="column is-6 is-offset-3">
        <h1 class="title is-1">
          Welcome to Gunter!
        </h1>
        <h2 class="subtitle is-4">
          Worlds smartest PDA
        </h2>
        <div class="box">
          <p class="control is-expanded">
            <input
              :value="userInput"
              class="input"
              type="text"
              placeholder="Start speaking or typing"
              @input="$emit('update:user-input', $event.target.value)"
              @keyup.enter="showHint = true"
            >
          </p>
        </div>
        <p v-show="showHint">
          Tip: Try entering "commute", "training", "lunch" or "travel".
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    userInput: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      showHint: false,
    };
  },
};
</script>

<style scoped>
#container {
  margin-top: 12rem;
}
.hero-body {
  margin-bottom: 0rem;
  padding-bottom: 1rem;
}
</style>
