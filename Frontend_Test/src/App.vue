<template>
  <Map />
</template>

<script>
import { ref, onMounted } from "vue";
import Map from "./Map.vue";

export default {
  setup() {
    const count = ref(0);
    const inc = () => {
      count.value++;
    };

    return {
      count,
      inc
    };
  },
  components: {
    Map
  }
};
</script>
