<template>
  <div class="flex">
    <Chat class="h-screen" />
    <Map class="flex-1 h-screen" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Map from "./components/Map.vue";
import Chat from "./components/Chat.vue";

export default {
  components: { Map, Chat }
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
