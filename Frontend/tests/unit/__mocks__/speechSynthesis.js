const speechSynthesisMock = (function speechSynthesisMock() {
  return {
    cancel() {
    },
  };
}());
Object.defineProperty(window, 'speechSynthesis', { value: speechSynthesisMock });
