/* eslint-disable new-cap */
export default {
  data() {
    return {
      finalSpan: '',
      interimSpan: '',
      finalTranscript: '',
      recognizing: false,
    };
  },
  created() {
    // eslint-disable-next-line no-undef
    const speechRecognition = new SpeechRecognition();
    speechRecognition.onresult = console.log;
    speechRecognition.start();
  },
  methods: {
    capitalize(s) {
      return s.replace(s.substr(0, 1), (m) => m.toUpperCase());
    },
    linebreak(s) {
      return s.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>');
    },
    startDictation() {
      if (this.recognizing) {
        this.recognition.stop();
        return;
      }
      this.finalTranscript = '';
      this.recognition.lang = 'en-US';
      this.recognition.start();
      this.finalSpan.innerHTML = '';
      this.interimSpan.innerHTML = '';
    },
    test() {
      if ('webkitSpeechRecognition' in window) {
        // eslint-disable-next-line no-undef
        const recognition = new webkitSpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          this.recognizing = true;
        };

        recognition.onerror = (event) => {
          console.log(event.error);
        };

        recognition.onend = () => {
          this.recognizing = false;
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            if (event.results[i].isFinal) {
              this.finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          this.finalTranscript = this.capitalize(this.finalTranscript);
          this.finalSpan.innerHTML = this.linebreak(this.finalTranscript);
          this.interimSpan.innerHTML = this.linebreak(interimTranscript);
        };
      }
    },
  },
};
