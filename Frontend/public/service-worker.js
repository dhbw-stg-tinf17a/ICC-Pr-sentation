/* eslint no-restricted-globals: 1 */

self.addEventListener('push', async (event) => {
  event.waitUntil(self.registration.showNotification('Gunter says hello', {
    body: event.data.text(),
    icon: '/favicon.jpg',
    badge: '/bade.png',
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});
