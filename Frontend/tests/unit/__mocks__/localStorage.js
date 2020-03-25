const localStorageMock = (function localStorageMock() {
  let store = { soundEnabled: 'true' };
  return {
    getItem(key) {
      return store[key];
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key) {
      delete store[key];
    },
  };
}());
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
