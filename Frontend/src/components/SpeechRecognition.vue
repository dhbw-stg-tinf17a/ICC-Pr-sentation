<template>
  <div id="speechRecognition">
    <b-tooltip
      label="Mute"
      position="is-bottom"
      type="is-light"
    >
      <button
        v-if="listening"
        class="button is-info"
        @click="stopSpeechRecognition"
      >
        <span class="icon">
          <i class="fas fa-microphone fa-2x" />
        </span>
      </button>
    </b-tooltip>
    <b-tooltip
      label="Unmute"
      position="is-bottom"
      type="is-light"
    >
      <button
        v-if="!listening"
        class="button is-info"
        @click="startSpeechRecognition"
      >
        <span class="icon">
          <i class="fas fa-microphone-slash fa-2x" />
        </span>
      </button>
    </b-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    userInput: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      listening: true,
      recognition: null,
      interimResult: '',
      recognizing: false,
      autoRestart: true,
      lastStartedAt: 0,
      isFinal: true,
      fixedUserInput: '',
    };
  },
  created() {
    this.initSpeechRecognition();
    this.startSpeechRecognition();
  },
  methods: {
    capitalize(s) {
      return s.replace(s.substr(0, 1), (m) => m.toUpperCase());
    },
    linebreak(s) {
      return s.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>');
    },
    startSpeechRecognition() {
      this.listening = true;
      this.recognition.lang = 'en-US';
      this.recognition.start();
      this.interimResult = '';
      if (this.userInput !== '') {
        this.$emit('update:user-input', `${this.userInput} `);
      }
      this.lastStartedAt = new Date().getTime();
    },
    stopSpeechRecognition() {
      this.listening = false;
      this.autoRestart = false;
      if (this.recognizing) {
        this.recognition.stop();
      }
    },
    initSpeechRecognition() {
      let finalTranscript = '';
      window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      this.recognition = new window.SpeechRecognition();

      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.recognizing = true;
      };

      this.recognition.onerror = (event) => {
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
          // if permission to use the mic is denied, turn off auto-restart
            this.autoRestart = false;
            console.error(event.error);
            break;
          default:
        }
      };

      this.recognition.onend = () => {
        this.recognizing = false;
        // auto restart if closed automatically and not by user action
        if (this.autoRestart) {
          // never restart automatically more than once per second
          const timeSinceLastStart = new Date().getTime() - this.lastStartedAt;
          this.autoRestartCount += 1;
          if (timeSinceLastStart < 1000) {
            setTimeout(() => {
              this.startSpeechRecognition();
            }, 1000 - timeSinceLastStart);
          } else {
            this.startSpeechRecognition();
          }
        }
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        if (this.isFinal) {
          this.fixedUserInput = this.userInput;
          this.isFinal = false;
        }
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        finalTranscript = this.capitalize(finalTranscript);
        this.interimResult = this.linebreak(interimTranscript);
        if (finalTranscript === '') {
          this.$emit('update:user-input', this.fixedUserInput + this.interimResult);
        } else {
          this.$emit('update:user-input', this.fixedUserInput + finalTranscript);
          this.isFinal = true;
          finalTranscript = '';
        }
      };
    },
  },
};

</script>
