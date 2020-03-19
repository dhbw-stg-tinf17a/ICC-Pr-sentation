<template>
  <div class="hero-body">
    <div
      id="container"
      class="container has-text-centered"
    >
      <div class="columns">
        <div class="column">
          <Chat
            :participants="participants"
            :myself="myself"
            :messages="messages"
            :on-message-submit="onMessageSubmit"
            chat-title="Gunter PDA"
            placeholder="Enter message"
            :colors="colors"
            :border-style="borderStyle"
            :hide-close-button="true"
            close-button-icon-size="20px"
            submit-icon-size="30px"
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
            allowfullscreen=""
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
          content: 'Hello my name is Gunter. Ask me for information about the use cases i provide!',
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
            bg: '#fff',
            text: '#bdb8b8',
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
        messageReceived: false,
      },
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.onMessageSubmit({
        content: to.query.usecase,
        myself: true,
        participantId: 2,
        timestamp: vm.getCurrentTimestamp(),
      });
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.onMessageSubmit({
      content: to.query.usecase,
      myself: true,
      participantId: 2,
      timestamp: this.getCurrentTimestamp(),
    });
    next();
  },
  methods: {
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
    loadMoreMessages(resolve) {
      setTimeout(() => {
        resolve(this.toLoad);
        this.messages.unshift(...this.toLoad);
        this.toLoad = [];
      }, 1000);
    },
    onMessageSubmit(message) {
      this.messages.push(message);
    },
  },
};
</script>

<style scoped>
.quick-chat-container {
  height: 29rem;
  width: 30rem;
}
iframe {
  height: 19rem;
}
</style>
