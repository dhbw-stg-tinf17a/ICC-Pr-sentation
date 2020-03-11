<template>
  <div
    id="help"
    class="hero-body"
  >
    <b-loading

      :is-full-page="false"
      :active.sync="iframeLoading"
      :can-cancel="true"
    />
    <div class="container">
      <iframe
        v-show="!iframeLoading"
        ref="iframe"
        src="https://calendar.google.com/calendar/embed?src=rroff00labrg6qt5gu3ol87ejo%40group.calendar.google.com&ctz=Europe%2FBerlin"
        style="border: 0"
        width="1200"
        frameborder="0"
        scrolling="no"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      iframeLoading: true,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.iframe.addEventListener('load', () => {
        this.iframeLoading = false;
      });
    });
  },
};
</script>

<style scoped>
iframe {
  height: 30rem;
}
.hero-body {
  position: relative;
  margin: 0rem 3rem 3rem 3rem;
  padding: 1rem 0 0 0;
}
</style>
