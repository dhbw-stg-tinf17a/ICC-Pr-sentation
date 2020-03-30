<template>
  <div class="hero-body">
    <div
      id="container"
      class="container has-text-centered"
    >
      <div class="columns is-vcentered">
        <div class="column">
          <Chat
            :participants="participants"
            :myself="myself"
            :messages="messages"
            :on-type="onType"
            :on-message-submit="submitMessage"
            chat-title="Gunter PDA"
            placeholder="Enter message"
            :colors="colors"
            :border-style="borderStyle"
            :hide-close-button="true"
            close-button-icon-size="20px"
            :submit-icon-size="30"
            :load-more-messages="toLoad.length > 0 ? loadMoreMessages : null"
            :async-mode="false"
            :scroll-bottom="scrollBottom"
            :display-header="true"
          />
        </div>
        <div class="column">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d84212.13668810249!2d9.012055799646186!3d48.73167512651731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e3!4m5!1s0x4799db3229863a35%3A0xdf0e3bbda30a81!2sHauptbahnhof%2C%20Stuttgart!3m2!1d48.784171!2d9.178921299999999!4m5!1s0x4799e06fba35c9c5%3A0x6937d91123557292!2sHulb%2C%20B%C3%B6blingen%2C%20Stuttgart!3m2!1d48.6792677!2d8.9823237!5e0!3m2!1sen!2sde!4v1584003581058!5m2!1sen!2sde"
            width="500"
            height="600"
            frameborder="0"
            style="border:0;"
            allowfullscreen
            aria-hidden="false"
            tabindex="0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chat } from 'vue-quick-chat';
import 'vue-quick-chat/dist/vue-quick-chat.css';
import UseCasesService from '@/services/UseCases';
import SpeechService from '@/services/SpeechSynthesis';

export default {
  components: {
    Chat,
  },
  props: {
    userInput: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      participants: [
        {
          name: 'Gunter',
          id: 1,
        },
      ],
      myself: {
        name: 'You',
        id: 2,
      },
      messages: [
        {
          content:
            'Hello my name is Gunter. Ask me for information about the use cases i provide!',
          myself: false,
          participantId: 1,
          timestamp: this.getCurrentTimestamp(),
        },
      ],
      colors: {
        header: {
          bg: '#d30303',
          text: '#fff',
        },
        message: {
          myself: {
            bg: 'rgb(200, 200, 200)',
            text: '#000000',
          },
          others: {
            bg: '#fb4141',
            text: '#fff',
          },
          messagesDisplay: {
            bg: '#f7f3f3',
          },
        },
        submitIcon: '#b91010',
      },
      borderStyle: {
        topLeft: '10px',
        topRight: '10px',
        bottomLeft: '10px',
        bottomRight: '10px',
      },
      toLoad: [],
      scrollBottom: {
        messageSent: true,
        messageReceived: true,
      },
    };
  },
  watch: {
    userInput() {
      if (
        document.getElementsByClassName('message-input')[0].innerText
        !== this.userInput
      ) {
        document.getElementsByClassName(
          'message-input',
        )[0].innerText = this.userInput;
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.submitMyMessage(to.query.usecase);
      if (to.query.usecase === 'commute') vm.commuteUseCase();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.submitMyMessage(to.query.usecase);
    if (to.query.usecase === 'commute') this.commuteUseCase();
    next();
  },
  methods: {
    handleApiError(error) {
      this.$buefy.toast.open({
        message: `Error ${error.response.data.status}: ${error.response.data.error}`,
        duration: 3000,
        type: 'is-danger',
      });
      if (localStorage.getItem('soundEnabled') === 'true') SpeechService.speak(`${error.response.data.error}. Sorry!`);
      this.submitMessage({
        content: `Error ${error.response.data.status}: ${error.response.data.error}`,
        myself: false,
        participantId: 1,
        timestamp: this.getCurrentTimestamp(),
      });
    },
    getCurrentTimestamp() {
      const date = new Date();
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds(),
      };
    },
    commuteUseCase() {
      UseCasesService.getCommuteUseCase()
        .then((response) => {
          const messageString = `Next Event: ${response.data.data.firstEvent.summary}\n`
            + `At: ${response.data.data.firstEvent.location}\n`
            + `Start: ${response.data.data.firstEvent.start}\n`
            + `Leave home: ${response.data.data.timeToLeave}\n\n`
            + `${response.data.data.weather.weather[0].description} `
            + `${response.data.data.weather.main.temp}°C\n\n`
            + `Quote of the day: ${response.data.data.quote.quote} -`
            + `${response.data.data.quote.author}`;

          this.submitMessage({
            content: messageString,
            myself: false,
            participantId: 1,
            timestamp: this.getCurrentTimestamp(),
          });
          if (localStorage.getItem('soundEnabled') === 'true') {
            SpeechService.speak(
              `Next Event: ${response.data.data.firstEvent.summary}`
                + ` at ${response.data.data.firstEvent.start}.`
                + ` You have to leave at ${response.data.data.timeToLeave}`,
            );
          }
        }).catch((error) => {
          this.handleApiError(error);
        });
    },
    travelUseCase() {
      UseCasesService.getTravelUseCase().then((response) => {
        this.submitMessage({
          content: response.data.textToDisplay,
          myself: false,
          participantId: 1,
          timestamp: this.getCurrentTimestamp(),
        });
        if (localStorage.getItem('soundEnabled') === 'true') {
          SpeechService.speak(response.data.textToRead);
        }
      }).catch((error) => {
        this.handleApiError(error);
      });
    },
    restaurantUseCase() {
      this.submitMessage({
        content: 'Coming soon. I promise...',
        myself: false,
        participantId: 1,
        timestamp: this.getCurrentTimestamp(),
      });
    },
    trainerUseCase() {
      this.submitMessage({
        content: 'Coming soon. I promise...',
        myself: false,
        participantId: 1,
        timestamp: this.getCurrentTimestamp(),
      });
    },
    onType(event) {
      this.$emit('update:user-input', event.target.innerText);
    },
    loadMoreMessages(resolve) {
      setTimeout(() => {
        resolve(this.toLoad);
        this.messages.unshift(...this.toLoad);
        this.toLoad = [];
      }, 1000);
    },
    submitMessage(message) {
      this.messages.push(message);
    },
    submitMyMessage(messageContent) {
      this.submitMessage({
        content: messageContent,
        myself: true,
        participantId: 2,
        timestamp: this.getCurrentTimestamp(),
      });
    },
  },
};
</script>

<style scoped>
.hero-body {
  padding-top: 1rem;
}
.quick-chat-container {
  height: 29rem;
  width: 30rem;
}
iframe {
  height: 19rem;
}
</style>
