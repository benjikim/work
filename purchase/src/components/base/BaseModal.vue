<script setup>
  import { ref, computed } from 'vue';
  import UtilityHTMLRenderer from '../utility/UtilityHTMLRenderer.vue';
  import UtilityComponentRenderer from '../utility/UtilityComponentRenderer.vue';
  import SubmitButton from '../input/SubmitButton.vue';
  import CloseIcon from 'vue-material-design-icons/Close.vue';
  import { useApiStore } from 'src/store/modules/api.js';

  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    actionButton: {
      type: Boolean,
      required: true,
    },
    outlinedActionButton: {
      type: Boolean,
      default: false,
      required: false,
    },
    outlinedSecondaryActionButton: {
      type: Boolean,
      default: false,
      required: false,
    },
    secondaryActionButton: {
      type: Boolean,
      required: false,
      default: false,
    },

    showCloseIcon: {
      type: Boolean,
      required: false,
      default: true,
    },

    /**
     * Option to show an action button that
     * closes the modal
     */
    showCloseButton: {
      type: Boolean,
      required: true,
    },
    compressCloseButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    outlinedCloseButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    header: {
      type: String,
      required: true,
    },
    body: {
      type: Object,
      required: true,
      default: () => ({ type: bodyTypeEnum.html, content: '', }),
      validator: (value) => {
        return Object.values(bodyTypeEnum).includes(value.type);
      },
    },
    buttonActionText: {
      type: String,
      required: false,
      default: '',
    },
    secondaryButtonActionText: {
      type: String,
      required: false,
      default: '',
    },
    width: {
      type: String,
      default: '373px',
      required: false,
    },
    showSubmitFormButton: {
      type: Boolean,
      default: false,
    },
    headerStyleOverride: {
      type: String,
      default: '',
      required: false,
    },
    footerStyleOverride: {
      type: String,
      default: '',
      required: false,
    },
  });

  const modal = ref(null);
  const apiStore = useApiStore();

  const classList = computed(() => {
    const classList = [];
    if (props.show) {
      classList.push('modal__open');
    }

    return classList;
  });

  const emit = defineEmits([
    'click:action',
    'click:secondAction',
    'click:close'
  ]);

  /**
   * Click handler to emit event when an
   * action is provided
   *
   * @returns {Void}
   * @emits click:action
   */
  const handleAction = () => {
    emit('click:action');
  };

  /* Click handler to emit event when an
   * action is provided
   *
   * @returns {Void}
   * @emits click:action
   */
  const handleSecondaryAction = () => {
    emit('click:secondAction');
  };

  const closeModal = async () => {
    modal.value.classList.remove('modal__open');
    emit('click:close');
    emit('click:action');
    if (props.id === 'modal-server-error') {
      await apiStore.fetchOrder();
    }
  };

  /**
   * Click handler for the entire modal. This will either
   * close the modal when the overlay is clicked OR run
   * the provided action method to force the user into
   * the prescribed action. e.g. sending the user back
   * to the quote form.
   *
   * @param {Event} e Browser event
   */
  const handleClick = (e) => {
    if (e.target?.id === props.id) {
      if (props.actionButton) {
        handleAction();
      } else if (props.secondaryActionButton) {
        handleSecondaryAction();
      } else {
        closeModal();
      }
    }
  };
</script>

<template>
  <div>
    <div
      :id="`${props.id}`"
      ref="modal"
      class="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full px-4 modal"
      :class="classList"
      @click="handleClick"
    >
      <div
        ref="modalContainer"
        role="dialog"
        class="relative p-4 mx-auto shadow-xl rounded-md bg-white modal__container"
        :style="{ width: `${props.width}` }"
      >
        <div class="modal__header-section">
          <h2
            class="modal__header pb-4"
            :style="headerStyleOverride"
          >{{ header }}</h2>
          <button
            v-if="showCloseIcon"
            type="button"
            aria-label="Close"
            @click="closeModal"
          >
            <close-icon
              aria-hidden="true"
              class="close-input-icon"
            ></close-icon>
          </button>
        </div>

        <div class="modal__body">
          <template v-if="body.type === 'text'">
            <p class="modal__body-text">{{ body.content }}</p>
          </template>

          <template v-if="body.type === 'html'">
            <UtilityHTMLRenderer :content="body.content"></UtilityHTMLRenderer>
          </template>

          <template v-if="body.type === 'list'">
            <ul>
              <li v-for="(item, index) in body.content" :key="index">
                {{ item }}
              </li>
            </ul>
          </template>

          <template v-if="body.type === 'component'">
            <UtilityComponentRenderer
              :name="body.componentName"
            ></UtilityComponentRenderer>
          </template>
        </div>

        <div
            class="modal__footer"
            :style="footerStyleOverride"
        >
          <BaseButton
            v-if="actionButton"
            class="my-4 mt-10 rounded-lg"
            :text="buttonActionText"
            :outlined="outlinedActionButton"
            size="full"
            @click="handleAction"
          >
          </BaseButton>

          <BaseButton
            v-if="secondaryActionButton"
            :text="secondaryButtonActionText"
            :outlined="outlinedSecondaryActionButton"
            size="full"
            class="rounded-lg"
            @click="handleSecondaryAction"
          >
          </BaseButton>

          <BaseButton
            v-if="showCloseButton"
            :class="`${compressCloseButton ? '' : 'my-4 mt-10'}`"
            :outlined="outlinedCloseButton"
            text="Close"
            size="full"
            @click="closeModal"
          ></BaseButton>

          <SubmitButton v-if="showSubmitFormButton" size="full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export const bodyTypeEnum = {
    html: 'html',
    text: 'text',
    list: 'list',
    component: 'component',
  };
</script>

<style lang="scss" scoped>
  .modal {
    opacity: 0;
    transition: opacity 0.3s ease-in;
    pointer-events: none;
    z-index: 1040;

    &__open {
      opacity: 1;
      pointer-events: all;
      display: block;
    }

    &__container {
      position: relative;
      top: 5vh;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      max-width: 600px;
      @media (max-width: 768px) {
        max-width: 90%;
        top: 5%;
      }
    }

    &__header {
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 32px;
      letter-spacing: 0px;
      text-align: left;
      line-height: 1.075em;
    }

    &__body-text {
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 28px;
      letter-spacing: 0px;
      text-align: left;
    }

    &__section-title {
      font-size: 26px;
      margin-bottom: 10px;
    }

    &__section-message {
      font-size: 18px;
    }

    &__header-section {
      flex-shrink: 0;
      position: relative;

      .close-input-icon {
        position: absolute;
        right: 0;
        top: 0;
      }
    }

    &__body {
      flex: 1;
      overflow-y: auto;
      padding-right: 1rem;
      margin-right: -1rem;
    }

    &__footer {
      flex-shrink: 0;
      margin-top: auto;
      background: white;
      border-top: 1px solid #eee;
      padding-top: 1rem;
    }

    .close-input-icon {
      pointer-events: auto;
      cursor: pointer;
    }

    .material-design-icon {
      font-size: 25px;
    }
  }
</style>
