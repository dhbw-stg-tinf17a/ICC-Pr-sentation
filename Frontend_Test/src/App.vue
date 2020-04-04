<template>
  <div id="map"></div>
</template>

<script>
import { ref, onMounted } from "vue";
import mapboxgl from "mapbox-gl";

export default {
  setup() {
    onMounted(() => {
      mapboxgl.accessToken =
        "pk.eyJ1IjoiZnNjaHVldHowNCIsImEiOiJjam12cnNxd2swOHI0M3ZvMThmbG1qMjdlIn0.AQOATykYs-7IwFRYxoNVGQ";
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v9"
      });
    });

    const count = ref(0);
    const inc = () => {
      count.value++;
    };

    return {
      count,
      inc
    };
  }
};
</script>

<style>
@import "~mapbox-gl/src/css/mapbox-gl.css";

#map {
  width: 100vw;
  height: 100vh;
}
</style>
