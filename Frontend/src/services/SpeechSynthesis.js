const functions = {
  speak(text) {
    if (localStorage.getItem('soundEnabled') === 'true') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  },
};

export default functions;
