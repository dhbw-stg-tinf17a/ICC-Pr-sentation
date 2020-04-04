<template>
  <Map />
</template>

<script>
import { ref, onMounted } from "vue";
import Map from "./Map.vue";

export default {
  components: {
    Map
  }
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
