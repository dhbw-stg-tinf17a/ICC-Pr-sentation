/* eslint no-restricted-globals: 1 */

self.addEventListener('push', async (event) => {
  const data = event.data.json();
  event.waitUntil(self.registration.showNotification(data.title, data.options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});
