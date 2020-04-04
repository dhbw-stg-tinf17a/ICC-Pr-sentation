<template>
  <div id="map" />
</template>

<script>
import mapboxgl from "mapbox-gl";
import { onMounted } from "vue";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZnNjaHVldHowNCIsImEiOiJjam12cnNxd2swOHI0M3ZvMThmbG1qMjdlIn0.AQOATykYs-7IwFRYxoNVGQ";

export default {
  setup() {
    onMounted(() => {
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v9",
        bounds: [
          [9.17702, 48.78232],
          [8.68417, 50.11552]
        ],
        fitBoundsOptions: {
          padding: 100
        }
      });

      map.on("load", () => {
        map.addSource("lines", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {
                  color: "#F7455D" // red
                },
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [9.17702, 48.78232],
                    [8.68417, 50.11552]
                  ]
                }
              }
            ]
          }
        });

        map.addLayer({
          id: "lines",
          type: "line",
          source: "lines",
          paint: {
            "line-width": 3,
            "line-color": ["get", "color"]
          }
        });
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
