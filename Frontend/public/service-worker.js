self.addEventListener('push', async event => {
  event.waitUntil(self.registration.showNotification('Gunter says hello', {
    body: 'This is only a test',
    icon: '/favicon.jpg',
    badge: '/bade.png'
  }));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
});
