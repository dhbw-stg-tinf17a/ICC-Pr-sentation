<template>
  <div
    id="preferences"
    class="hero-body"
  >
    <h1 class="title">
      Preferences
    </h1>
  </div>
</template>

<script>
import UserService from '../services/User';

export default {
  created() {
    UserService.getUser().then((result) => {
      console.log(result);
    });
  },
};
</script>
