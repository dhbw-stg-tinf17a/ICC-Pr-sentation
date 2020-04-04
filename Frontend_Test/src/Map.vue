<template>
  <div id="map" />
</template>

<script>
import mapboxgl from "mapbox-gl";
import { onMounted } from "vue";

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
  }
};
</script>

<style scoped>
@import "~mapbox-gl/dist/mapbox-gl.css";

#map {
  width: 100vw;
  height: 100vh;
}
</style>
