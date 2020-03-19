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
            :on-type="onType"
            :on-message-submit="onMessageSubmit"
            :chat-title="chatTitle"
            :placeholder="placeholder"
            :colors="colors"
            :border-style="borderStyle"
            :hide-close-button="hideCloseButton"
            :close-button-icon-size="closeButtonIconSize"
            :on-close="onClose"
            :submit-icon-size="submitIconSize"
            :load-more-messages="toLoad.length > 0 ? loadMoreMessages : null"
            :async-mode="asyncMode"
            :scroll-bottom="scrollBottom"
            :display-header="displayHeader"
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
      visible: true,
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
          content: 'New travel information available!\nDo you wanna see it?',
          myself: false,
          participantId: 1,
          timestamp: {
            year: 2019, month: 3, day: 5, hour: 20, minute: 10, second: 3, millisecond: 123,
          },
        },
        {
          content: 'Yes',
          myself: true,
          participantId: 2,
          timestamp: {
            year: 2019, month: 4, day: 5, hour: 19, minute: 10, second: 3, millisecond: 123,
          },
        },
        {
          content: 'The use case information is:\nBla bla bla\n\nShould i show more?',
          myself: false,
          participantId: 1,
          timestamp: {
            year: 2019, month: 5, day: 5, hour: 10, minute: 10, second: 3, millisecond: 123,
          },
        },
      ],
      chatTitle: 'My chat title',
      placeholder: 'send your message',
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
      hideCloseButton: false,
      submitIconSize: '30px',
      closeButtonIconSize: '20px',
      asyncMode: false,
      toLoad: [
        {
          content: 'Commute Use Case',
          myself: true,
          participantId: 2,
          timestamp: {
            year: 2010, month: 3, day: 5, hour: 10, minute: 10, second: 3, millisecond: 123,
          },
          uploaded: true,
          viewed: true,
        },
        {
          content: 'Commute: Tomorrow\nDeparture Time: 09.00am\nDepart from: Main Station\n\nQuote of the Day: It is cold at night!',
          myself: false,
          participantId: 1,
          timestamp: {
            year: 2011, month: 0, day: 5, hour: 19, minute: 10, second: 3, millisecond: 123,
          },
          uploaded: true,
          viewed: true,
        },
      ],
      scrollBottom: {
        messageSent: true,
        messageReceived: false,
      },
      displayHeader: true,
    };
  },
  methods: {
    onType() {
      // here you can set any behavior
    },
    loadMoreMessages(resolve) {
      setTimeout(() => {
        resolve(this.toLoad); // We end the loading state and add the messages
        // Make sure the loaded messages are also added
        // to our local messages copy or they will be lost
        this.messages.unshift(...this.toLoad);
        this.toLoad = [];
      }, 1000);
    },
    onMessageSubmit(message) {
      /*
            * example simulating an upload callback.
            * It's important to notice that even when your message wasn't send
            * yet to the server you have to add the message into the array
            */
      this.messages.push(message);

      /*
            * you can update message state after the server response
            */
      // timeout simulating the request
      setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
        message.uploaded = true;
      }, 2000);
    },
    onClose() {
      this.visible = false;
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
