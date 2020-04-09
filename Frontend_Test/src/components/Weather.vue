<template>
  <div class="p-10">
    <div>{{ title }}</div>
    <div class="flex">
      <WeatherIcon class="flex-1" :code="weather.day.iconCode" />
      <div class="flex-1 self-center">
        <div>{{ tempToStr(weather.temperature.minimum) }}</div>
        <div>{{ tempToStr(weather.temperature.maximum) }}</div>
      </div>
    </div>
    <div>{{ weather.day.longPhrase }}</div>
  </div>
</template>

<script>
import WeatherIcon from "./WeatherIcon.vue";

export default {
  methods: {
    tempToStr: temp => `${temp.value} °${temp.unit}`
  },
  components: { WeatherIcon },
  props: ["title", "weather"]
};
</script>
