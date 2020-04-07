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
            submit-icon-size="30px"
            :async-mode="false"
            :scroll-bottom="scrollBottom"
            :display-header="true"
          />
        </div>
        <div class="column">
          <iframe
            v-if="$route.query.usecase === 'travel-planning'"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d345381.66563874023!2d10.888241136786803!3d47.44520309878122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479d02ee5107876d%3A0x34e257ebca223d97!2sZugspitze!5e0!3m2!1sen!2sde!4v1586291009392!5m2!1sen!2sde"
            width="800"
            height="600"
            frameborder="0"
            style="border:0;"
            allowfullscreen=""
            aria-hidden="false"
            tabindex="0"
          />
          <iframe
            v-if="$route.query.usecase === 'morning-routine'"
            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d42064.071434944395!2d9.183972170768989!3d48.78180501712007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e3!4m5!1s0x4799c4ef08b86541%3A0x7fd29cebc1be3dd!2sSchl%C3%BCsselwiesen%2021%2C%2070186%20Stuttgart!3m2!1d48.7818051!2d9.2189911!4m5!1s0x0%3A0xcac3f85c1ddfaef4!2sBaden-W%C3%BCrttemberg%20Cooperative%20State%20University!3m2!1d48.7823!2d9.176219999999999!5e0!3m2!1sen!2sde!4v1586291400541!5m2!1sen!2sde"
            width="800"
            height="600"
            frameborder="0"
            style="border:0;"
            allowfullscreen=""
            aria-hidden="false"
            tabindex="0"
          />
          <iframe
            v-if="$route.query.usecase === 'personal-trainer'"
            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d10516.556965759963!2d9.225725933574962!3d48.77923191847479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e3!4m5!1s0x4799c4ef08b86541%3A0x7fd29cebc1be3dd!2sSchl%C3%BCsselwiesen%2021%2C%2070186%20Stuttgart!3m2!1d48.7818051!2d9.2189911!4m5!1s0x4799c45a56d6a2a1%3A0xa867e2002a4edf26!2sInselbad%20Untert%C3%BCrkheim!3m2!1d48.7792853!2d9.2446866!5e0!3m2!1sen!2sde!4v1586291982256!5m2!1sen!2sde"
            width="800"
            height="600"
            frameborder="0"
            style="border:0;"
            allowfullscreen=""
            aria-hidden="false"
            tabindex="0"
          />
          <iframe
            v-if="$route.query.usecase === 'lunch-break'"
            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d5258.734450453219!2d9.15597100061059!3d48.77487912164868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e3!4m5!1s0x4799db48e7f64b7b%3A0xee6d7efd9e4b577f!2sDHBW%20Stuttgart%20Roteb%C3%BChlplatz%2C%20Roteb%C3%BChlplatz%2C%20Stuttgart!3m2!1d48.773559399999996!2d9.171002!4m5!1s0x4799db6a083862a3%3A0xdc0cc29b04f20857!2sDie%20Metzgerei!3m2!1d48.774244599999996!2d9.1559019!5e0!3m2!1sen!2sde!4v1586291828906!5m2!1sen!2sde"
            width="800"
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
      nextLink: null,
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
      vm.submitMyMessage(vm.transformRouteNameToReadableName(to.query.usecase));
      const functionName = vm.transformRouteNameToFunctionName(to.query.usecase);
      vm[functionName]();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.submitMyMessage(this.transformRouteNameToReadableName(to.query.usecase));
    const functionName = this.transformRouteNameToFunctionName(to.query.usecase);
    this[functionName]();
    next();
  },
  methods: {
    // transformation to get 'morningRoutineUseCase' out of morning-routine
    transformRouteNameToFunctionName(routeName) {
      return `${routeName.split('-')[0]
            + routeName.charAt(routeName.indexOf('-') + 1).toUpperCase()
            + routeName.split('-')[1].substr(1)}UseCase`;
    },
    // transformation to get 'Morning Routine' out of morning-routine
    transformRouteNameToReadableName(routeName) {
      return `${routeName.charAt(0).toUpperCase() + routeName.split('-')[0].substr(1)} `
            + `${routeName.charAt(routeName.indexOf('-') + 1).toUpperCase()
            + routeName.split('-')[1].substr(1)}`;
    },
    userConfirmed(userInput) {
      if (this.nextLink) {
        this.submitMyMessage(userInput);
        UseCasesService.getFurtherInformation(this.nextLink)
          .then((response) => {
            this.handleApiResponse(response);
          }).catch((error) => {
            this.handleApiError(error);
          });
        this.nextLink = null;
      }
    },
    handleApiError(error) {
      this.$buefy.toast.open({
        message: `Error ${error.response.status}: ${error.response.statusText}`,
        duration: 3000,
        type: 'is-danger',
      });
      if (localStorage.getItem('soundEnabled') === 'true') SpeechService.speak(`${error.response.statusText}. Sorry!`);
      this.submitMessage({
        content: `Error ${error.response.status}: ${error.response.statusText}`,
        myself: false,
        participantId: 1,
        timestamp: this.getCurrentTimestamp(),
      });
    },
    handleApiResponse(response) {
      this.submitMessage({
        content: response.data.textToDisplay,
        myself: false,
        participantId: 1,
        timestamp: this.getCurrentTimestamp(),
      });
      if (response.data.furtherAction) {
        this.submitMessage({
          content: response.data.furtherAction,
          myself: false,
          participantId: 1,
          timestamp: this.getCurrentTimestamp(),
        });
      }

      if (localStorage.getItem('soundEnabled') === 'true') {
        SpeechService.speak(response.data.textToRead);
        if (response.data.furtherAction) {
          SpeechService.speak(response.data.furtherAction);
        }
      }

      this.nextLink = response.data.nextLink;
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
    morningRoutineUseCase() {
      UseCasesService.getMorningRoutineUseCase()
        .then((response) => {
          this.handleApiResponse(response);
        }).catch((error) => {
          this.handleApiError(error);
        });
    },
    travelPlanningUseCase() {
      UseCasesService.getTravelPlanningUseCase().then((response) => {
        this.handleApiResponse(response);
      }).catch((error) => {
        this.handleApiError(error);
      });
    },
    lunchBreakUseCase(position) {
      if (!position) {
        this.getCoordinates();
      } else {
        UseCasesService.getLunchBreakUseCase(
          position.coords.latitude,
          position.coords.longitude,
        ).then((response) => {
          this.handleApiResponse(response);
        }).catch((error) => {
          this.handleApiError(error);
        });
      }
    },
    personalTrainerUseCase() {
      UseCasesService.getPersonalTrainerUseCase().then((response) => {
        this.handleApiResponse(response);
      }).catch((error) => {
        this.handleApiError(error);
      });
    },
    getCoordinates() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.lunchBreakUseCase, this.geolocationError);
      } else {
        this.$buefy.toast.open({
          message: 'Geolocation is not supported by this browser.',
          duration: 3000,
          type: 'is-danger',
        });
      }
    },
    geolocationError(err) {
      this.$buefy.toast.open({
        message: `ERROR(${err.code}): ${err.message}`,
        duration: 3000,
        type: 'is-danger',
      });
    },
    onType(event) {
      this.$emit('update:user-input', event.target.innerText);
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
