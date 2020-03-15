<template>
  <div
    id="Default404"
    class="hero-body"
  >
    <div class="container">
      <h1 class="is-size-3">
        Sorry. This page doesnt exist.
      </h1>
      <router-link
        class="router-link"
        :to="{name: 'landingPage'}"
      >
        <div class="button">
          Back to Home
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
};
</script>
