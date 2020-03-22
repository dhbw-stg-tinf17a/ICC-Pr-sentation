/* eslint no-restricted-globals: 1 */

self.addEventListener('push', async (event) => {
  const data = event.data.json();
  event.waitUntil(self.registration.showNotification(data.title, data.options));
});

async function handleNotificationClick(event) {
  event.notification.close();

  const { usecase } = event.notification.data || {};
  if (usecase) {
    const allClients = await self.clients.matchAll();
    if (allClients.length > 0) {
      const client = allClients[0];
      client.postMessage(event.notification.data);
      return;
    }

    self.clients.openWindow(`/dialog?usecase=${usecase}`);
  }
}

self.addEventListener('notificationclick', (event) => event.waitUntil(handleNotificationClick(event)));
