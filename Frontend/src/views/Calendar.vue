<template>
  <div
    id="help"
    class="hero-body"
  >
    <div class="container">
      <iframe
        id="idIframe"
        src="https://calendar.google.com/calendar/embed?src=rroff00labrg6qt5gu3ol87ejo%40group.calendar.google.com&ctz=Europe%2FBerlin"
        style="border: 0"
        width="1200"
        frameborder="0"
        scrolling="no"
        @onload="iframeLoaded()"
      />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    iframeLoaded() {
      const iFrameID = document.getElementById('idIframe');
      if (iFrameID) {
        // here you can make the height, I delete it first, then I make it again
        iFrameID.height = '';
        iFrameID.height = `${iFrameID.contentWindow.document.body.scrollHeight}px`;
      }
    },
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
