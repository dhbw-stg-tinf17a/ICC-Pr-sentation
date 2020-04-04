<template>
  <div class="flex">
    <Chat class="flex-1 h-screen" />
    <Map class="flex-1 h-screen" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Map from "./Map.vue";
import Chat from "./Chat.vue";

export default {
  components: { Map, Chat }
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
