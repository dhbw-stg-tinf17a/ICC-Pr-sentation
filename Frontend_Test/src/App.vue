<template>
  <div class="flex main">
    <Chat class="chat h-screen z-50 bg-gray-100" />
    <!-- <Map class="flex-1 h-screen" /> -->
    <!-- <Weather class="absolute bg-gray-100 right-0 top-0 m-10 rounded-md" /> -->
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Map from "./components/Map.vue";
import Chat from "./components/Chat.vue";
import Weather from "./components/Weather.vue";

export default {
  components: { Map, Chat, Weather }
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

.main {
  background: center/cover url("/background.jpg");
}

.chat {
  width: 30rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.25);
}
</style>
