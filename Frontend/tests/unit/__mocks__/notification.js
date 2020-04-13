const notificationMock = (function notificationMock() {
  return {
    requestPermission() {
      return Promise.resolve();
    },
  };
}());
Object.defineProperty(window, 'Notification', { value: notificationMock });
