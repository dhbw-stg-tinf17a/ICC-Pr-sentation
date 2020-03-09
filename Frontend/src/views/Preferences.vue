<template>
  <div
    v-if="user"
    id="preferences"
    class="hero-body"
  >
    <h1 class="title">
      Preferences for {{ user.name }}
    </h1>
  </div>
</template>

<script>
import UserService from '../services/User';

export default {
  data() {
    return {
      user: null,
    };
  },
  created() {
    UserService.getUser().then((result) => {
      this.user = result.data.data;
    });
  },
};
</script>
