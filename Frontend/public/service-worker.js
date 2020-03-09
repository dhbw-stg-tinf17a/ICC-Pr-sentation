self.addEventListener('push', event => {
  console.log(`push event: ${event.data.text()}`);
});
